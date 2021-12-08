import { useEffect, useState } from "react";
import { ethers } from "ethers";

import contractAbi from "./Abis/ContractAbi.json";
const CONTRACT_ADDRESS = "0x191E2EB61d588c2fD6898A02f788A5a354CfE785";

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState();
  const [isRinkeby, setIsRinkeby] = useState(false);
  const [error, setError] = useState();

  // Actions

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("please install meta mask");
      return;
    } else {
      console.log("we have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("we found an account", account);
      setAccount(account);
      if (ethereum.networkVersion == 4) {
        setIsRinkeby(true);
      }
    } else {
      console.log("no authorized accounts found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("please install meta mask");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("account connected", accounts[0]);
      setAccount(accounts[0]);
    } catch (e) {
      console.log(e);
    }
  };

  const getContractInfo = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi.abi,
          signer
        );

        const name = await contract.name();
        const symbol = await contract.symbol();

        setContract({ name, symbol });
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    checkWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", (_chainId) => {
        if (_chainId == "0x4") {
          setIsRinkeby(true);
        } else {
          setIsRinkeby(false);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (account && isRinkeby) {
      getContractInfo();
    }
  }, [account, isRinkeby]);

  return (
    <div className="flex flex-col justify-center items-center">
      <p className="mt-10 font-bold text-4xl text-blue-500">
        Finvaul assignment
      </p>
      {!account ? (
        <button
          className="bg-blue-400 p-5 mt-5 text-white rounded-md"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      ) : null}
      {!error ? null : <p style={{ color: "orange" }}>{error}</p>}
      {account && isRinkeby ? null : (
        <p className="mt-10 font-bold text-ml text-red-500">
          please connect your wallet to Rinkeby testnet
        </p>
      )}
      {contract ? (
        <div>
          <p className="mt-10 font-bold text-ml text-gray-700">
            the contract name is {contract.name}
          </p>
          <p className=" font-bold text-ml text-gray-700">
            the contract symbol is {contract.symbol}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default App;
