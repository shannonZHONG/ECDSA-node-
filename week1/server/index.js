const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");


app.use(cors());
app.use(express.json());

const balances = {
  "0x54155b94b12434cead7b0e573f397f88dabc86ac": 100,
  "0x99b91a7911ddbe12c7441c859c4e42a25ec0b8e1": 50,
  "0x377b629b29c00cd14e9cbc9bb3893a0c30f79cd3": 75,
};


const privateKeys = {
  "0x54155b94b12434cead7b0e573f397f88dabc86ac": "3d0ac192a1d9d3b86834f836ede69c68d3563e07e43233f45c1f10db76dfabcd",
  "0x99b91a7911ddbe12c7441c859c4e42a25ec0b8e1": "570adc845714aec18f5da5ab73ab018af76634bacac902480adbb9c8e5ff49e3",
  "0x377b629b29c00cd14e9cbc9bb3893a0c30f79cd3": "c6f9cfe2a9d44734c6301d92ad59cdecbebc55c7c0fa0e9d17dfef36865c1935  "
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  const privateKey = privateKeys[address];
  res.send({ balance, privateKey });
});

app.post("/send", async (req, res) => {

  try {

  const { signature, hexMessage, recoveryBit, sender, recipient, amount } = req.body;

  
  const signaturePublicKey = secp.recoverPublicKey(hexMessage, signature, recoveryBit);
  const signatureAddressNotHex = keccak256(signaturePublicKey.slice(1)).slice(-20);
  const signatureAddress = "0x" + toHex(signatureAddressNotHex);
  

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds! double check" });
  } 
  else if (signatureAddress !== sender) {
    res.status(400).send({message: "Are you sure you are the sender?"})
  }
  else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
} catch(error){
  console.log(error);
}
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  balances[address] = balances[address] || 0;
}

