import React, { useState, useEffect } from "react";
import {
  Image,
  Heading,
  Text,
  Center,
  Flex,
  Box,
  Button,
  SimpleGrid,
  useToast,
  MenuDescendantsProvider,
} from "@chakra-ui/react";
import { FaPlus, FaMinus, FaLongArrowAltRight } from "react-icons/fa";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useWeb3ExecuteFunction } from "react-moralis";
//import Sale from "../images/Public.png";
//import Sale from "../images/Sale.png";
import Public from "./../../images/Public.png";
//import SaleEnd from "../images/SaleEnd.png";
import BannerBG from "./../../images/MarketBG.png";
import Minter from "./../../images/DeviousMinter.png";
import Banner from "./../../images/moneymonkeys/monkeyBanner.png";
import Monkey from "./../../images/moneymonkeys/monkey3.jpg";
import MonkeyStatic from "./../../images/moneymonkeys/monkeyStatic.png";
import "style.css";
import { mainStAddress, mainStABI } from "contracts";

const textInfo = "#ea8f08";
const info = {
  presaler: false,
  remaining: 0,
  amount: 1,
};
const styles = {
  background: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
  },
  main: {
    flexDirection: "column",
    maxWidth: "600px",
    marginInline: "1rem",
    border: "solid 2px white",
    backgroundColor: "rgba(1, 1, 1, 0.7)",
    backdropFilter: "saturate(180%) blur(5px)",
    borderRadius: "15px 15px 15px 15px",
    marginBlock: "1rem",
    paddingBottom: "1rem",
    boxShadow:
      "0 4px 18px 0 rgba(133, 133, 222, 0.5), 0 6px 30px 0 rgba(202, 149, 237, 0.7)",
  },

  button: {
    color: "black",
    maxWidth: "110px",
    marginInline: "3px",
    borderRadius: "1rem",
    fontWeight: "600",
    border: "none",
  },
  mintButton: {
    background: "linear-gradient(to right, #67d4d6, #89f85a",
    color: "black",
    maxWidth: "110px",
    position: "absolute",
    bottom: "14%",
    padding: "1.5rem",
    borderRadius: "1rem",
    fontWeight: "600",
    border: "none",
  },
};

function MoneyMonkeysMinter() {
  const toast = useToast();
  const textInfo = "#ea8f08";
  const contractProcessor = useWeb3ExecuteFunction();
  const { chainId, marketAddress, walletAddress, NFTcontractABI } =
    useMoralisDapp();
  const [status, setStatus] = useState(info);
  const { Moralis, isAuthenticated, isInitialized, user } = useMoralis();
  const [loading, setLoading] = useState(false);
  const [supply, setSupply] = useState(0);
  const [nftPrice, setNftPrice] = useState("2");
  const [contract, setContract] = useState("");

  const failToast = (err) => {
    toast({
      description: `${err.data ? err.data.message : err.message}`,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  };
  const succToast = (succ) => {
    toast({
      description: `${succ.message}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  //Get NFT Price from DB
  //Sets NFT price and Swapper Contract
  useEffect(() => {
    async function getPrice() {
      const query = new Moralis.Query("Minter");
      query.equalTo("collection", "moneymonkeys");
      const results = await query.first();
      let x = results?.attributes;
      setNftPrice(x.price);
      setContract(x.contract);
    }
    getPrice();
  }, []);

  async function mint() {
    const succ = { messsage: "Successfully Minted! Congrats" };
    setLoading(true);
    const ops = {
      contractAddress: contract,
      functionName: "mintNFT",
      abi: mainStABI,
      params: {
        amount: status.amount,
      },
      msgValue: Moralis.Units.ETH(status.amount * parseFloat(nftPrice)),
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        //console.log("success");
        setLoading(false);
        succToast(succ);
      },
      onError: (err) => {
        //console.log(error);
        setLoading(false);
        failToast(err);
      },
    });
  }

  useEffect(() => {
    if (isAuthenticated) {
      getSupply();
    }
  }, [isAuthenticated, window.location]);

  // UPDATE AMOUNT FOR DISPLAY AND CALCULATION
  const updateAmount = (newAmount) => {
    if (newAmount >= 1) {
      setStatus((prevState) => ({
        ...prevState,
        amount: newAmount,
      }));
    }
  };

  const getSupply = async () => {
    const options = {
      chain: "bsc",
      address: mainStAddress,
      function_name: "totalSupply",
      abi: mainStABI,
    };
    const supply = await Moralis.Web3API.native.runContractFunction(options);
    setSupply(5000 - supply);
  };

  return (
    <div className="monkey-body">
      {/* <Center style={styles.main}> */}

      <Flex
        className="centered"
        flexDirection={{ base: "column", sm: "row" }}
        backgroundColor="#363636"
        borderRadius={12}
        overflow="none"
        marginTop={4}
      >
        <Image
          width="250px"
          height="auto"
          src={Monkey}
          alt="Monkey"
          padding={2}
          borderRadius={16}
        />
        <Center
          flexDirection="column"
          justifyContent="space-around"
          marginBlock={2}
        >
          <Text color="white" fontSize="md">
            {" "}
            Mint Your Money Monkey!
          </Text>
          <SimpleGrid
            borderRadius={8}
            backgroundColor="#363636"
            padding={{ base: 1, sm: 3 }}
            columns={3}
            spacing={{ base: 1, sm: 6 }}
            alignItems={"center"}
            maxH="50%"
            //marginBlock={"auto"}
          >
            <Button
              style={styles.button}
              onClick={() => updateAmount(status.amount - 1)}
              isLoading={loading}
              //loadingText="Waiting"
              _hover={{ bg: "#888" }}
            >
              <FaMinus />
            </Button>
            <Center flexDirection={"column"}>
              <Text
                style={{
                  color: "#30ad64",
                  fontWeight: 600,
                  fontSize: "1.5em",
                }}
              >
                {status.amount}
              </Text>
              <Text color={"white"}>{loading ? `Waiting..` : `Selected`} </Text>
            </Center>
            <Button
              style={styles.button}
              onClick={() => updateAmount(status.amount + 1)}
              isLoading={loading}
              //loadingText="Waiting"
              _hover={{ bg: "#888" }}
            >
              <FaPlus />
            </Button>
          </SimpleGrid>
          <Text color="white" fontSize="sm">
            Price is 0.2 BNB Each
          </Text>
          <Button
            background="linear-gradient(to top, #079567, #89f85a, #aaff8c)"
            size={"lg"}
            color="#363636"
            maxWidth="110px"
            padding="1.5rem"
            marginInline={"auto"}
            borderRadius="1rem"
            fontWeight="600"
            disabled={!isAuthenticated}
            onClick={() => mint()}
            isLoading={loading}
            boxShadow={"0 4px 8px -2px black"}
            _hover={{
              //border: "2px solid rgb(165, 151, 75)",
              boxShadow:
                "0 4px 18px 0 rgba(133, 133, 222, 0.5), 0 6px 30px 0 rgba(165, 151, 75, 0.7)",
            }}
          >
            {isAuthenticated ? `Mint ${status.amount}` : "Sign In"}
          </Button>
        </Center>
      </Flex>
      <section className="monkey-description centered margin">
        <Image
          width="auto"
          borderRadius={8}
          src={Banner}
          alt="Banner"
          marginInline="auto"
        />
        <Flex
          alignItems="center"
          mt={4}
          flexDirection={{ base: "column", sm: "row" }}
        >
          <Image
            width="250px"
            height="auto"
            src={MonkeyStatic}
            alt="Monkey"
            padding={2}
            borderRadius={16}
            //display={{ base: "none", sm: "block" }}
          />
          <Flex flexDirection="column" padding={4}>
            <Box
              width="200px"
              backgroundColor="#30ad64"
              borderRadius={12}
              marginBottom={-2}
              zIndex="200"
            >
              <Heading
                color="white"
                paddingInline={4}
                paddingBottom={1}
                margin="auto"
              >
                Overview
              </Heading>
            </Box>
            <Box backgroundColor="#cfd9dc" padding={4} borderRadius={12}>
              <p>
                Main Street Money Monkey NFTs are a generative collection of
                unique pixel artworks that are limited to a total amount of 4282
                and created from a variety of different attributes/traits. These
                NFTs will split monthly yield farming profits from the BananaBag
                to supply their owners with passive rewards in the form of
                $MAINST. Along with acting as a buyback and burn mechanism for
                the $MAINST’s deflationary tokenomics
              </p>
            </Box>
          </Flex>
        </Flex>
      </section>
      <section>
        <Center flexDirection="column" pb={6}>
          <a
            href="https://www.buymainstreet.com/moneymonkeys"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Main Street Website Link"
          >
            View The Main Street Website
          </a>
          <a
            href="https://bscscan.com/address/0xa36c806c13851f8b27780753563fddaa6566f996"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Main Street Contract Link"
          >
            View The Contract
          </a>
        </Center>
      </section>
    </div>
  );
}

export default MoneyMonkeysMinter;
