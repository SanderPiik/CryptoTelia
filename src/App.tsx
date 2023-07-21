import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  Container,
  Grid,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableBody,
  Typography
} from "@mui/material";
import InputFields from './Components/InputFields';

interface PriceData {
  close: number;
}

interface CoinData {
  id: string;
  name: string;
  amount: number;
}

const CoinRow: React.FC<CoinData> = ({ id, name, amount }) => {
  const [closePrice, setClosePrice] = useState<number | null>(null);
  const priceCellRef = useRef<HTMLTableCellElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.coinpaprika.com/v1/coins/${id}/ohlcv/today?quote=usd`
        );
        const data: PriceData[] = await response.json();
        const closePrices = data.map((price) => price.close);
        setClosePrice(closePrices[0]);
      } catch (error) {
        console.error('Error fetching price data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (priceCellRef.current) {
      priceCellRef.current.textContent = (closePrice || 0) * amount + '';
    }
  }, [closePrice, amount]);

  if (closePrice === null) {
    return null;
  }

  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell align="right">{amount}</TableCell>
      <TableCell id='price' align="right" ref={priceCellRef}></TableCell>
    </TableRow>
  );
};

function App() {
  const [coinName, setCoinName] = useState("");
  const [amount, setAmount] = useState(0);
  const [coins, setCoins] = useState<{ [key: string]: CoinData }>({});
  const [error, setError] = useState("");
  const totalSumRef = useRef<HTMLTableCellElement | null>(null);

  const calculateTotalSum = () => {
    if (totalSumRef.current) {
      const priceCells = Array.from(document.querySelectorAll('td#price'));
      const sum = priceCells.reduce((acc, cell) => acc + Number(cell.textContent || 0), 0);
      totalSumRef.current.textContent = sum + '';
    }
  };

  useEffect(() => {
    const interval = setInterval(calculateTotalSum, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedData = window.localStorage.getItem('COINS');
    if (storedData !== null) {
      setCoins(JSON.parse(storedData));
      calculateTotalSum();
    }
  }, []);

  useEffect(() => {
    if (Object.keys(coins).length !== 0) {
      window.localStorage.setItem('COINS', JSON.stringify(coins));
    }
  }, [coins]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('https://api.coinpaprika.com/v1/coins');
    const data: { id: string, name: string }[] = await response.json();
    const coinNames = data.map((coin) => coin.name);

    if (!coinNames.includes(coinName)) {
      setError("Invalid coin name");
      return;
    }

    if (amount < 0) {
      setError("Invalid amount");
      return;
    }

    const existingCoin = coins[coinName];
    if (existingCoin) {
      setCoins({
        ...coins,
        [coinName]: {
          ...existingCoin,
          amount: existingCoin.amount + amount
        }
      });
    } else {
      const coinId: string = data.find((coin) => coin.name === coinName)?.id || '';

      setCoins({
        ...coins,
        [coinName]: { id: coinId, name: coinName, amount }
      });
    }

    setCoinName("");
    setAmount(0);
    setError("");
  };

  return (
    <div className="App">
      <Container maxWidth="md">
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="center"
        >
          <InputFields
            name={coinName}
            setName={setCoinName}
            amount={amount}
            setAmount={setAmount}
            handleAdd={handleAdd}
          />
          {error && (
            <Typography variant="body2" color="error" align="center">
              {error}
            </Typography>
          )}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(coins).map((coin) => (
                    <CoinRow key={coin.name} {...coin} />
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right">Total Sum: <span ref={totalSumRef}></span></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
