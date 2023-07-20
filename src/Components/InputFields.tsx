import { Button, Grid, TextField } from "@mui/material";

interface Props {
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    amount: number;
    setAmount: React.Dispatch<React.SetStateAction<number>>;
    handleAdd: (e: React.FormEvent) => void;
}

const InputFields = ({name, setName, amount, setAmount, handleAdd}: Props) => {
    return (
        <form onSubmit={e => handleAdd(e)} style={{ textAlign: 'center' }}>
        <Grid
          container
          spacing={2}
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <Grid item>
            <TextField
              label="Coin name"
              variant="outlined"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter a valid name"
              style={{ width: '300px' }}
            />
          </Grid>
          <Grid item>
            <TextField
              label="Amount"
              variant="outlined"
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              placeholder="Enter an amount"
              style={{ width: '300px' }}
            />
          </Grid>
          <Grid item>
            <Button variant="outlined" type="submit">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>      
    );
};

export default InputFields;