import React, { useEffect, useState } from "react";
import { useRouteMatch, useLocation, useHistory } from "react-router-dom";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { getEllipsisTxt } from "helpers/formatters";
import "../../style.css";
import { Modal } from "antd";
import {
  Text,
  Flex,
  Tooltip,
  Button,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Heading,
  Box,
} from "@chakra-ui/react";
import { useIPFS } from "../../hooks/useIPFS";
import ShareButton from "./ShareButton";

//ICONS
import { AiOutlineTag, AiOutlineCloseCircle } from "react-icons/ai";
import { MdOutlineCancel } from "react-icons/md";
import { CgDollar } from "react-icons/cg";
import LoadingSVG from "../../images/LoadingSVG.svg";
import Failed from "../../images/Failed.jpg";
import AuctionListing from "./AuctionListing";
import Bids from "./Bids";
import PriceHistory from "./PriceHistory";

import { marketABI, marketAddress } from "contracts";
import { useAuction } from "hooks/useAuction";
import { useNft } from "hooks/useNft";
import { BsCheckLg } from "react-icons/bs";

//Timer
import Countdown, { zeroPad } from "react-countdown";

const textInfo = "#ea8f08";

const styles = {
  main: {
    paddingInline: "2rem",
    marginTop: "2rem",
    minHeight: "50vh",
    width: "100%",
    maxWidth: "1100px",
  },
  back: {
    paddingInline: "1rem",
    paddingBlock: "0.25rem",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  list: {
    color: "white",
  },
  buyButton: {
    marginBlock: "0.5rem",
    marginInline: "auto",
    borderRadius: "0.5rem",
    paddingBlock: "0.75rem",
    fontSize: "18px",
    fontWeight: "500",
  },
  offerButton: {
    width: "50%",
    marginTop: "10px",
    marginRight: "1rem",
    borderRadius: "0.5rem",
    paddingBlock: "0.75rem",
    fontSize: "18px",
    fontWeight: "500",
  },
};

let owner;

const InfoPage = (props) => {
  const history = useHistory();
  let { url } = useRouteMatch();
  const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
  const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
  const { resolveLink } = useIPFS();
  const collection = props.match.params.collection.toLowerCase();
  const id = props.match.params.id;
  const { Moralis, isAuthenticated, user, isInitialized } = useMoralis();
  const { pathname } = useLocation();

  const [nft, setNFT] = useState(null);
  const [displayImage, setDisplayImage] = useState();
  const queryRarity = useMoralisQuery("Licks");
  const [rarityObject, setRarityObject] = useState({});
  const [slice, setSlice] = useState(8);
  const [nftOwner, setOwner] = useState({});
  const { walletAddress } = useMoralisDapp();
  //Loading and Modal Control
  const [loading, setLoading] = useState(true);
  const [isTokenAuction, setisTokenAuction] = useState(false);
  const [auctionItem, setAuctionItem] = useState(null);
  const [openBuyNow, setOpenBuyNow] = useState(false);
  const [openBNB, setOpenBNB] = useState(false);
  const [openDgold, setOpenDgold] = useState(false);

  //BID SETUP
  const [nftContractAddress, setNftContractAddress] = useState();
  const [tokenId, setTokenId] = useState();
  const [erc20Token, setErc20Token] = useState();
  const [tokenAmount, setTokenAmount] = useState(0);
  const [bnbAmount, setBNBAmount] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [approval, setApproval] = useState(0);
  const [complete, setComplete] = useState(false);
  const [bids, setBids] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("Offline");
  const toast = useToast();

  const failToast = (err) => {
    toast({
      description: err.data
        ? err.data.message.substring(0, 50)
        : err.message.substring(0, 50),
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

  const { approveToken } = useNft();
  const {
    getAuctionInfo,
    withdrawAuction,
    getAllowance,
    getBlockchainData,
    finalizeAuction,
    increaseAmount,
    takeBid,
  } = useAuction();
  const options = {
    token_address: nftContractAddress,
    token_id: tokenId,
  };

  // Random component
  const Completionist = () => <span>This Auction is Complete</span>;
  // Renderer callback with condition
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      setComplete(true);
      handleComplete();
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return (
        <Flex alignContent={"center"}>
          <Text mr={2}>Auction Ends:</Text>
          <Text color="#ea8f08" fontSize="16px" alignSelf={"center"}>
            {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
          </Text>
        </Flex>
      );
    }
  };

  const fetchRarity = JSON.parse(
    JSON.stringify(queryRarity.data, [
      "objectId",
      "address",
      "tokenId",
      "rarity",
      "rank",
      "attributes",
    ])
  );
  const uniqueId = [
    "8712",
    "7367",
    "8289",
    "5252",
    "418",
    "6464",
    "7353",
    "156",
  ];
  const waitTimer = (ms) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    async function fetchData() {
      if (!isInitialized) {
        await Moralis.start({ serverUrl, appId });
      }
      const params = { address: collection, id: id };
      let blockchainNFT;
      try {
        blockchainNFT = await Moralis.Cloud.run("getNFT", params); //-------------CLOUD FUNCTION
      } catch (error) {
        console.log(error);
        history.push(`/collection/${props.match.params.collection}`);
      }

      let dbNFT;
      if (
        collection?.toLowerCase() ==
        "0x8db96c06e9e0d04b8377643f325ec342a3693a14"
      ) {
        const query = new Moralis.Query("DeviousLicks");
        query.fullText("address", collection);
        query.equalTo("tokenId", id);
        dbNFT = await query.first();
      } else {
        const query = new Moralis.Query("Collections");
        query.fullText("address", collection);
        query.equalTo("tokenId", id);
        dbNFT = await query.first();
      }
      const moralisNft = dbNFT?.attributes;
      //console.log(moralisNft);
      if (blockchainNFT) {
        if (!blockchainNFT?.metadata) {
          blockchainNFT.metadata = moralisNft?.metadata; //JSON.parse(NFT.metadata);
        } else {
          blockchainNFT.metadata = JSON.parse(blockchainNFT?.metadata); //JSON.parse(NFT.metadata);
        }
        blockchainNFT.image = moralisNft.image;
        blockchainNFT.attributes = moralisNft.attributes;
        blockchainNFT.rank = moralisNft.rank;
        blockchainNFT.rarity = moralisNft.rarity;
        blockchainNFT.likes = moralisNft.likes;

        setOwner(blockchainNFT.owner_of);
        setRarityObject(blockchainNFT);
        setNFT(blockchainNFT);
        setDisplayImage(blockchainNFT.image);
      }
      
    }
    fetchData();
    return () => {
      Moralis.LiveQuery.close();
      //console.log("Closed Main Server");
    };
  }, []);

  useEffect(() => {
    if (!nftContractAddress) return;
    subscribe();
    Moralis.LiveQuery.on("open", () => {
      //console.log("socket connection established");
      setUpdateStatus("Live");
    });
    return () => {
      Moralis.LiveQuery.close();
      //console.log("Closed Live Server");
      Moralis.LiveQuery.on("close", () => {
        //console.log("socket connection closed");
        setUpdateStatus("Offline");
      });
    };
  }, [nftContractAddress]);

  async function subscribe() {
    if (subscribed) return;
    //console.log("Subscribing");
    let query = new Moralis.Query("AuctionListing");
    query.equalTo("nftContractAddress", nft?.token_address?.toLowerCase());
    query.equalTo("tokenId", nft?.token_id);
    query.notEqualTo("sold", true);
    query.notEqualTo("canceled", true);
    let subscription = await query.subscribe();
    subscription.on("update", (object) => {
      setAuctionItem(object);
      
    });
    setSubscribed(true);
  }

  async function updateLocalItem() {
    const updatedItem = await auctionItem.fetch();
    setAuctionItem(updatedItem);
  }

  async function setBidDetails(auctionItem) {
    const bid = "" + auctionItem?.attributes?.highestBid;

    if (
      auctionItem?.attributes?.erc20Token ==
      "0x9e545b66afad4836656601b0a6c6c4508b33e2c4"
    ) {
      setisTokenAuction(true);
    } else {
      setisTokenAuction(false);
    }
    setNftContractAddress(auctionItem?.attributes?.nftContractAddress);
    setTokenId(auctionItem?.attributes?.tokenId);
    setErc20Token(auctionItem?.attributes?.erc20Token);
  }

  useEffect(async () => {
    if (!auctionItem) return;
    setBidDetails(auctionItem);
  }, [auctionItem]);

  const getRarity = async (nft) => {
    if (nft?.symbol == "LICK") {
      const query = new Moralis.Query("DeviousLicks");
      query.equalTo("tokenId", nft?.token_id);
      const object = await query.first();
      //console.log(object);
      setRarityObject(object);
    } else {
      const query = new Moralis.Query("Collections");
      query.equalTo("tokenId", nft?.token_id);
      const object = await query.first();
    }
  };

  //USED FOR LICKS COLLECTION ONLY
  async function isUnique() {
    let id = nft?.token_id;
    if (
      uniqueId.includes(id) &&
      (nft?.token_address).toLowerCase() ==
        "0x8db96c06e9e0d04b8377643f325ec342a3693a14"
    ) {
      setSlice(3);
      return;
    }
    if (
      (nft?.token_address).toLowerCase() ==
      "0x8db96c06e9e0d04b8377643f325ec342a3693a14"
    ) {
      setSlice(8);
      return;
    } else {
      setSlice(nft?.attributes?.length);
    }
  }

  function handleClick() {
    props.selectNFT(nft);
    history.push(`${url}/sell`);
  }

  function handleBidButton() {
    if (isTokenAuction) {
      checkAllowance();
      setOpenDgold(true);
    } else {
      setOpenBNB(true);
    }
  }

  async function bidDG() {
    if (
      auctionItem.attributes.highestBid > 0 &&
      tokenAmount * 10 ** 9 < auctionItem.attributes.highestBid * 1.01
    ) {
      toast({
        description: `Bid too low`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    let succ = { message: "Bid Successful" };
    try {
      const amount = Moralis.Units.Token(tokenAmount.toString(), 9);
      const options = {
        contractAddress: marketAddress,
        functionName: "makeBid",
        abi: marketABI,
        params: {
          _nftContractAddress: nftContractAddress,
          _tokenId: tokenId,
          _erc20Token: erc20Token,
          _tokenAmount: amount,
        },
      };

      const transaction = await Moralis.executeFunction(options);
      const receipt = await transaction.wait(3);
      if (receipt.status == 1) {
        setLoading(false);
        succToast(succ);
        updateHighestBid(amount);
        setOpenDgold(false);
        setBNBAmount(0);
        setTokenAmount(0);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.log(err.message);
      failToast(err);
      setLoading(false);
    }
  }

  //***Could be reduced into one function for BNB and Token
  async function bidBNB() {
    setLoading(true);
    let succ = { message: "Bid Successful" };
    try {
      const value = Moralis.Units.ETH(bnbAmount);
      const options = {
        contractAddress: marketAddress,
        functionName: "makeBid",
        abi: marketABI,
        params: {
          _nftContractAddress: nftContractAddress,
          _tokenId: tokenId,
          _erc20Token: "0x0000000000000000000000000000000000000000",
          _tokenAmount: 0,
        },
        msgValue: value,
      };

      const transaction = await Moralis.executeFunction(options);
      const receipt = await transaction.wait(3);
      if (receipt.status == 1) {
        setLoading(false);
        succToast(succ);
        updateHighestBid(value);
        setOpenBNB(false);
        setBNBAmount(0);
        setTokenAmount(0);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.log(err.message);
      failToast(err);
      setLoading(false);
    }
  }

  async function updateHighestBid(amount) {
    const bid = parseInt(amount);
    const min = parseInt(auctionItem?.attributes?.minPrice);
    const buyNow = parseInt(auctionItem?.attributes?.buyNowPrice);
    const isLive = auctionItem?.attributes?.isLive == true ? true : false;
    let succ = { message: "Congratulations on your new NFT!" };

    const timer = await getTime();
    await waitTimer(1500);
    //BUY NOW CHECK
    if (buyNow > 0 && bid >= buyNow) {
      auctionItem.set("isLive", false);
      auctionItem.set("sold", true);
      auctionItem.set("nftHighestBidder", walletAddress.toLowerCase());
      if (isTokenAuction) {
        auctionItem.set("salePriceDgold", String(amount));
      } else if (!isTokenAuction) {
        auctionItem.set("salePriceBNB", String(amount));
      }
      await auctionItem.save().then((updated) => {
        succToast(succ);
        return;
      });
    }
    //New Bid Over Min -- Starting auction or updating timer
    if (bid >= min) {
      auctionItem.set("isLive", true);
      auctionItem.set("highestBid", bid);
      auctionItem.set("nftHighestBidder", walletAddress.toLowerCase());
      auctionItem.set("auctionEndUnix", parseInt(timer));
      await auctionItem.save().then((updated) => {
        getAuctionItem();
        return;
      });
    }
    //New Bid under min price
    if (bid < min) {
      auctionItem.set("highestBid", bid);
      auctionItem.set("nftHighestBidder", walletAddress.toLowerCase());
      await auctionItem.save().then((updated) => {
        getAuctionItem();
        return;
      });
    }
  }

  useEffect(async () => {
    if (!nft) return;
    getAuctionItem();
    //getOwner();
    isUnique();
    return () => {
      Moralis.LiveQuery.close();
    };
  }, [nft]);

  async function getAuctionItem() {
    const info = await getAuctionInfo(collection, id);
    await waitTimer(500);
    const query = new Moralis.Query("AuctionListing");
    query.equalTo("nftContractAddress", collection);
    query.equalTo("tokenId", id);
    query.notEqualTo("sold", true);
    query.notEqualTo("canceled", true);
    query.notEqualTo("minPrice", 0);
    query.descending("updatedAt");
    const results = await query.first();
    let dbAuction = results;
    //console.log(dbAuction);
    let bcAuction = info;

    if (results) {
      dbAuction.set("auctionEndUnix", parseInt(bcAuction.auctionEnd));
      dbAuction.set("buyNowPrice", bcAuction.buyNowPrice);
      dbAuction.set("minPrice", bcAuction.minPrice);
      dbAuction.set("highestBid", parseInt(bcAuction.nftHighestBid));
      dbAuction.set(
        "nftHighestBidder",
        bcAuction.nftHighestBidder.toLowerCase()
      );
      dbAuction.set("nftRecipient", bcAuction.nftRecipient.toLowerCase());
      dbAuction.set(
        "whitelistedBuyer",
        bcAuction.whitelistedBuyer.toLowerCase()
      );
      dbAuction.save().then((dbAuction) => {
        setAuctionItem(dbAuction);
        setLoading(false);
      });
    } else {
      setAuctionItem(null);
      setLoading(false);
    }
  }

  async function withdrawListing() {
    setLoading(true);
    let succ = { message: "Auction Listing Canceled" };
    try {
      const results = await withdrawAuction(collection, id);
      if (results.status == 1) {
        auctionItem.set("canceled", true);
        await auctionItem.save().then((object) => {
          setLoading(false);
          succToast(succ);
          getAuctionItem();
        });
      }
    } catch (err) {
      console.log(err.message);
      failToast(err);
      setLoading(false);
    }
  }

  async function checkAllowance() {
    const address = user.get("ethAddress");
    const results = await getAllowance(address);
    const amount = parseInt(results);
    setAllowance(amount / 10 ** 9);
  }
  async function getBlockchain() {
    const results = await getBlockchainData(nftContractAddress, tokenId);
    const unix = parseInt(results.auctionEnd._hex);
    const date = new Date(unix * 1000);
  }

  async function getTime() {
    const results = await getBlockchainData(collection, id);
    return results;
  }

  async function settleAuction() {
    setLoading(true);
    let succ = { message: "Auction Settled, Enjoy!" };
    try {
      const results = await finalizeAuction(collection, id);
      if (results.status == 1) {
        const salePrice = auctionItem?.attributes?.highestBid;
        auctionItem.set("sold", true);
        if (isTokenAuction) {
          auctionItem.set("salePriceDgold", String(salePrice));
        } else if (!isTokenAuction) {
          auctionItem.set("salePriceBNB", String(salePrice));
        }

        auctionItem.set("isLive", false);
        await auctionItem.save().then((object) => {
          succToast(succ);
          setLoading(false);
          getAuctionItem();
        });
      }
    } catch (err) {
      failToast(err);
      setLoading(false);
      console.log(err.message);
    }
  }

  async function takeHighestBid() {
    setLoading(true);
    let succ = { message: "Bid Accepted!" };
    try {
      const results = await takeBid(collection, id);
      if (results.status == 1) {
        const salePrice = auctionItem?.attributes?.highestBid;
        auctionItem.set("sold", true);
        auctionItem.set("complete", true);

        if (isTokenAuction) {
          auctionItem.set("salePriceDgold", String(salePrice));
        } else if (!isTokenAuction) {
          auctionItem.set("salePriceBNB", String(salePrice));
        }

        auctionItem.set("isLive", false);
        await auctionItem.save().then(() => {
          setLoading(false);
          succToast(succ);
          getAuctionItem();
        });
      }
    } catch (err) {
      console.log(err.message);
      failToast(err);
      setLoading(false);
    }
  }

  async function handleIncreaseAmount() {
    setLoading(true);
    let succ = { message: "Approval Amount Increased!" };
    try {
      const results = await increaseAmount(
        marketAddress,
        Moralis.Units.Token(approval.toString(), 9)
      );
      //console.log(results);
      if (results.status == 1) {
        checkAllowance();
        setLoading(false);
        succToast(succ);
      }
    } catch (err) {
      console.log(err.message);
      failToast(err);
      setLoading(false);
    }
  }

  async function handleComplete() {
    let succ = { message: "Auction Time Ended!" };
    let isComplete = auctionItem.get("complete");
    if (!isComplete) {
      auctionItem.set("complete", true);
      await auctionItem.save().then((newObject) => {
        //setAuctionItem(newObject);
        succToast(succ);
        getAuctionItem();
      });
    }
  }

  //Shorthand Checks for display
  const isOwner =
    auctionItem?.attributes?.nftSeller?.toLowerCase() ==
    user?.get("ethAddress")?.toLowerCase()
      ? true
      : false;

  const isLive = auctionItem?.attributes?.isLive == true ? true : false;
  const isSold = auctionItem?.attributes?.sold == true ? true : false;
  const isComplete = auctionItem?.attributes?.complete == true ? true : false;
  const isCanceled = auctionItem?.attributes?.canceled == true ? true : false;
  const buyNow = auctionItem ? auctionItem?.attributes?.buyNowPrice : null;

  ////////////////////////////////////////////---------------------------------------------------BUY NOW LOGIC
  async function increaseBuyNowAllowance() {
    let initial = allowance * 10 ** 9;
    let newBigAmount = buyNow - initial;
    let newApproval = newBigAmount / 10 ** 9;
    //console.log(newApproval);

    setLoading(true);
    let succ = { message: "Approval increased, Ready to Buy!" };
    try {
      const results = await increaseAmount(
        marketAddress,
        Moralis.Units.Token(newApproval.toString(), 9)
      );
      if (results.status == 1) {
        checkAllowance();
        setLoading(false);
        succToast(succ);
      }
    } catch (err) {
      console.log(err.message);
      failToast(err);
      setLoading(false);
    }
  }

  const handleBuyNowButton = async () => {
    let initial = allowance * 10 ** 9;
    if (isTokenAuction && initial >= buyNow) {
      buyNowDG();
    } else if (isTokenAuction && initial < buyNow) {
      increaseBuyNowAllowance();
    } else {
      buyNowBNB();
    }
  };

  const buyNowModal = async () => {
    if (isTokenAuction) {
      checkAllowance();
      setOpenBuyNow(true);
    } else {
      setOpenBuyNow(true);
    }
  };

  async function updateBuyNow(amount) {
    if (isTokenAuction) {
      auctionItem.set("salePriceDgold", amount);
    } else if (!isTokenAuction) {
      auctionItem.set("salePriceBNB", amount);
    }
    auctionItem.set("sold", true);
    auctionItem.set("isLive", false);
    auctionItem.set("nftHighestBidder", walletAddress.toLowerCase());
    await auctionItem.save().then(() => {
      getAuctionItem();
    });
  }

  async function buyNowDG() {
    if (buyNow == null) return;
    let buyAmount = buyNow / 10 ** 9;
    let succ = { message: "Enjoy your new NFT!" };
    try {
      const amount = Moralis.Units.Token(String(buyAmount), 9);
      //console.log(amount);

      const options = {
        contractAddress: marketAddress,
        functionName: "makeBid",
        abi: marketABI,
        params: {
          _nftContractAddress: nftContractAddress,
          _tokenId: tokenId,
          _erc20Token: erc20Token,
          _tokenAmount: amount,
        },
      };

      const transaction = await Moralis.executeFunction(options);
      const receipt = await transaction.wait(3);
      //console.log(receipt);
      if (receipt.status == 1) {
        setLoading(false);
        succToast(succ);
        updateBuyNow(amount);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.log(err.message);
      failToast(err);
      setLoading(false);
    }
  }
  async function buyNowBNB() {
    if (buyNow == null) return;
    setLoading(true);
    let succ = { message: "Enjoy your new NFT!" };
    try {
      const value = buyNow;
      //console.log(value);

      const options = {
        contractAddress: marketAddress,
        functionName: "makeBid",
        abi: marketABI,
        params: {
          _nftContractAddress: nftContractAddress,
          _tokenId: tokenId,
          _erc20Token: "0x0000000000000000000000000000000000000000",
          _tokenAmount: 0,
        },
        msgValue: value,
      };

      const transaction = await Moralis.executeFunction(options);
      const receipt = await transaction.wait(3);
      //console.log(receipt);
      if (receipt.status == 1) {
        setLoading(false);
        succToast(succ);
        //console.log("Buy Successfull");
        updateBuyNow(value);
      } else {
        //console.log("Buy Failed");
        setLoading(false);
      }
    } catch (err) {
      console.log(err.message);
      failToast(err);
      setLoading(false);
    }
  }

  function getAttributes() {
    console.log("Getting Attributes");
  }

  return (
    <>
      <div className="main-body">
        <div className="main-container">
          <div className="item-wrapper">
            <div className="item-summary">
              <div className="item-image">
                <Image
                  className="nft-image"
                  src={displayImage}
                  alt="Card Image"
                  align={"center"}
                  fallbackSrc={LoadingSVG}
                  onError={() => {
                    setDisplayImage(Failed);
                  }}
                />
              </div>
              {nft?.symbol === "LICK" && (
                <div className="nft-ranking-wrapper">
                  <div className="nft-rank-wrapper">
                    <div className="nft-rank">
                      <div className="nft-rank-label">Rank</div>
                      <div className="nft-rank-data">{rarityObject?.rank}</div>
                    </div>
                  </div>
                  <div className="nft-score-wrapper">
                    <div className="nft-score">
                      <div className="nft-score-label">Score</div>
                      <div className="nft-score-data">
                        {Math.round(
                          (rarityObject?.rarity + Number.EPSILON) * 100
                        ) / 100}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="nft-details">
                <div className="nft-details-items">
                  Contract Address{" "}
                  <a
                    className="contract-link"
                    href={`https://bscscan.com/address/${nft?.token_address}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {getEllipsisTxt(nft?.token_address, 8)}
                  </a>
                </div>
                <div className="nft-details-items">
                  Token ID <span>{nft?.token_id}</span>
                </div>
                <div className="nft-details-items">
                  Token Standard <span>{nft?.contract_type}</span>
                </div>
                <div className="nft-details-items">
                  Symbol <span>{nft?.symbol}</span>
                </div>
              </div>
            </div>
            <div className="item-info">
              <section className="item-header">
                <Flex
                  position="absolute"
                  right="0.5rem"
                  top="2.5rem"
                  alignContent="center"
                >
                  <Text
                    color="gray"
                    fontSize="28px"
                    alignSelf="center"
                    marginRight="1rem"
                  >
                    Share
                  </Text>
                  <Tooltip
                    hasArrow
                    label="Share Options"
                    bg="gray.600"
                    placement="top"
                  >
                    <ShareButton
                      title={"Check out this AWESOME NFT on NFTGold!"}
                      via={"DeviousLicks"}
                      hashtags={["NFTGold"]}
                    />
                  </Tooltip>
                  
                </Flex>
                <Button
                  colorScheme="blue"
                  position="absolute"
                  top="5.5rem"
                  right="0.5rem"
                  onClick={() =>
                    history.push(`/collection/${props.match.params.collection}`)
                  }
                >
                  View Collection
                </Button>
                <div className="item-text">
                  {nft?.metadata?.name && (nft?.metadata?.name).includes("#")
                    ? nft?.metadata?.name.split("#", 1)
                    : nft?.metadata?.name}
                </div>
                <div className="item-text-id">#{nft?.token_id}</div>
                {auctionItem != undefined ? (
                  <div className="item-text-owner">
                    Owned by{"  "}
                    <a
                      className="contract-link"
                      href={`https://bscscan.com/address/${auctionItem?.attributes?.nftSeller}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {auctionItem?.attributes?.nftSeller?.toLowerCase() ==
                      user?.get("ethAddress")?.toLowerCase()
                        ? "YOU"
                        : getEllipsisTxt(auctionItem?.attributes?.nftSeller, 8)}
                    </a>
                  </div>
                ) : (
                  <div className="item-text-owner">
                    Owned by{"  "}
                    <a
                      className="contract-link"
                      href={`https://bscscan.com/address/${nft?.owner_of}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {nft?.owner_of?.toLowerCase() ==
                      user?.get("ethAddress")?.toLowerCase()
                        ? "YOU"
                        : getEllipsisTxt(nft?.owner_of, 8)}
                    </a>
                  </div>
                )}
                {auctionItem && (
                  <Text color={"white"}>
                    Realtime Updates:{" "}
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: updateStatus == "Live" ? "green" : "red",
                      }}
                    >
                      {updateStatus}
                    </span>{" "}
                  </Text>
                )}
                {auctionItem && (
                  <Text color="white">
                    Listed on:{" "}
                    {auctionItem?.attributes?.createdAt.toLocaleDateString()}
                  </Text>
                )}
              </section>

              {auctionItem &&
              //auctionItem?.attributes?.complete != true &&
              !isSold &&
              !isCanceled ? (
                <section className="trade-station">
                  <div className="sale-price-label">
                    {!isLive && !isComplete ? (
                      `NFT Auction: Not Live`
                    ) : (
                      <>
                        {auctionItem?.attributes?.auctionEndUnix > 0 && (
                          <Countdown
                            date={auctionItem?.attributes.auctionEndUnix * 1000}
                            //onComplete={() => console.log("Timer Completed")}
                            renderer={renderer}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div className="sale-price">
                    <Flex flexDir={"column"} justifyContent="center">
                      <Text fontSize={{ base: "22px", md: "26px" }} mb={2}>
                        {!isTokenAuction &&
                          !isLive &&
                          `Auction Starting Price: ${(
                            auctionItem?.attributes.minPrice /
                            10 ** 18
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })} BNB`}
                        {isTokenAuction &&
                          !isLive &&
                          `Auction Starting Price: ${(
                            auctionItem?.attributes.minPrice /
                            10 ** 9
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })} dG`}
                      </Text>
                      {auctionItem?.attributes?.buyNowPrice > 0 && (
                        <Text fontSize={{ base: "22px", md: "26px" }}>
                          {isTokenAuction
                            ? `Buy Now: ${(
                                auctionItem?.attributes?.buyNowPrice /
                                10 ** 9
                              ).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })} dGold`
                            : `Buy Now: ${(
                                auctionItem?.attributes?.buyNowPrice /
                                10 ** 18
                              ).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })} BNB`}
                        </Text>
                      )}

                      {isTokenAuction &&
                        auctionItem?.attributes?.highestBid > 0 && (
                          <Text fontSize={{ base: "22px", md: "26px" }}>
                            Highest Bid:{" "}
                            {(
                              auctionItem?.attributes?.highestBid /
                              10 ** 9
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}{" "}
                            dG
                          </Text>
                        )}
                      {!isTokenAuction &&
                        auctionItem?.attributes?.highestBid > 0 && (
                          <Text fontSize={{ base: "22px", md: "26px" }}>
                            Highest Bid:{" "}
                            {(
                              auctionItem?.attributes?.highestBid /
                              10 ** 18
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}{" "}
                            BNB
                          </Text>
                        )}
                    </Flex>
                  </div>
                  <div className="sale-buttons-wrapper">
                    {auctionItem && isOwner && !isLive && (
                      <Button
                        size="large"
                        type="primary"
                        leftIcon={<MdOutlineCancel />}
                        colorScheme={"red"}
                        width={{ base: "100%", lg: "45%" }}
                        style={styles.buyButton}
                        loading={loading}
                        disabled={loading}
                        onClick={() => {
                          //console.log(user.get("ethAddress"));
                          //console.log(auctionItem);

                          withdrawListing();
                        }}
                      >
                        {loading ? `Please Wait..` : `Cancel Listing?`}
                      </Button>
                    )}
                    {auctionItem &&
                      isOwner &&
                      auctionItem?.attributes?.highestBid > 0 &&
                      bids[0]?.canceled != true &&
                      !isComplete && (
                        <Button
                          size="large"
                          type="primary"
                          leftIcon={<AiOutlineTag />}
                          colorScheme={"blue"}
                          width={{ base: "100%", lg: "45%" }}
                          style={styles.buyButton}
                          loading={loading}
                          disabled={loading}
                          onClick={() => {
                            takeHighestBid();
                          }}
                        >
                          {loading ? `Please Wait..` : `Take Offer`}
                        </Button>
                      )}
                    {auctionItem?.attributes?.nftSeller?.toLowerCase() !=
                      user?.get("ethAddress")?.toLowerCase() &&
                      complete != true && (
                        <>
                          <Button
                            size="large"
                            //type="primary"
                            mx="auto"
                            leftIcon={<AiOutlineTag />}
                            colorScheme={"blue"}
                            width={{ base: "100%", lg: "45%" }}
                            style={styles.buyButton}
                            disabled={!isAuthenticated}
                            //disabled
                            loading={loading}
                            onClick={() => {
                              handleBidButton();
                            }}
                          >
                            {isAuthenticated ? `Place Bid` : `Sign In to bid`}
                          </Button>
                          {buyNow > 0 && (
                            <Button
                              size="large"
                              type="primary"
                              leftIcon={<CgDollar />}
                              colorScheme={"blue"}
                              width={{ base: "100%", lg: "45%" }}
                              style={styles.buyButton}
                              disabled={!isAuthenticated}
                              loading={loading}
                              onClick={() => {
                                //console.log(Math.floor(Date.now() / 1000));
                                buyNowModal();
                              }}
                            >
                              {isAuthenticated ? `Buy Now` : `Sign In to buy`}
                            </Button>
                          )}
                        </>
                      )}
                    {isLive && isComplete && (
                      <Tooltip
                        hasArrow
                        label="Pays the seller and transfers the NFT to buyer"
                        bg="gray.600"
                        placement="top"
                      >
                        <Button
                          size="large"
                          mx="auto"
                          //type="primary"
                          leftIcon={<BsCheckLg />}
                          colorScheme={"green"}
                          width={{ base: "100%", lg: "45%" }}
                          style={styles.buyButton}
                          loading={loading}
                          disabled={loading || !isAuthenticated}
                          onClick={() => {
                            //console.log("Finalize");
                            settleAuction();
                          }}
                        >
                          {isAuthenticated
                            ? loading
                              ? `Please Wait..`
                              : `Finalize Auction`
                            : `Sign in to Finalize`}
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </section>
              ) : (
                <section className="trade-station">
                  <Text
                    align={"center"}
                    fontSize="18px"
                    paddingBlock={3}
                    color={"white"}
                  >
                    {" "}
                    This NFT is not currently for sale
                  </Text>
                </section>
              )}
              {nft?.owner_of == walletAddress && !auctionItem ? (
                <section className="trade-station">
                  <div className="sale-price-label">
                    You own this NFT. List it for sale below
                  </div>

                  <div className="sale-buttons-wrapper">
                    <Button
                      size="large"
                      width={{ base: "100%", lg: "45%" }}
                      mx="auto"
                      type="primary"
                      leftIcon={<AiOutlineTag />}
                      colorScheme={"blue"}
                      style={styles.buyButton}
                      //disabled={true}
                      disabled={loading}
                      isLoading={loading}
                      onClick={() => handleClick()}
                    >
                      SELL
                    </Button>
                  </div>
                </section>
              ) : null}
              {auctionItem && (
                <Bids
                  contract={collection}
                  tokenId={id}
                  isInitialized={isInitialized}
                  auctionItem={auctionItem}
                  isTokenAuction={isTokenAuction}
                  setBidNumber={setBids}
                  setAuctionItem={setAuctionItem}
                  update={getAuctionItem}
                  setLoading={setLoading}
                  loading={loading}
                />
              )}
              {rarityObject?.attributes && (
                <div className="traits-wrapper">
                  {rarityObject?.attributes.slice(0, slice).map((item, i) => {
                    return (
                      <div className="traits-container" key={i}>
                        <div className="trait-label">{item.trait_type}</div>
                        <div className="trait">{item.value}</div>
                        <div className="trait-score">
                          {Number.parseFloat(
                            Math.round(
                              ((1 / item.rarityScore) * 100 + Number.EPSILON) *
                                100
                            ) / 100
                          ).toFixed(1)}
                          % have this trait
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="item-description-wrapper">
                <div className="description-label">
                  NFT Collection Description
                </div>
                {nft?.metadata ? (
                  <div className="description-data">
                    {nft?.metadata.description}
                  </div>
                ) : (
                  <div className="description-data">
                    Description Currently Unvailable
                  </div>
                )}
              </div>
              {isInitialized && (
                <PriceHistory
                  contract={collection}
                  tokenId={id}
                  isInitialized={isInitialized}
                  auctionItem={auctionItem}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title={[<div className="modal-fixed-header">Place Your BNB Bid</div>]} ///--------------------------------BNB Modal
        visible={openBNB}
        footer={null}
        closable={false}
        centered={true}
        destroyOnClose={true}
        width="100%"
        style={{ minWidth: "350px", maxWidth: "500px" }}
      >
        <ul style={{ padding: "1rem" }}>
          <li>
            <Text fontSize="md">
              Your bid must be at minimum 1% higher than the current highest
              bid, unless there are no active bids
            </Text>
          </li>
          <li>
            <Text fontSize="md">
              A <span style={{ color: "#ea8f08" }}>24 hour</span> timer will
              begin once the Minimum (starting) Price has been met. This will
              reset with each new higher bid
            </Text>
          </li>
          <li>
            <Text fontSize="md">
              Once the timer reaches zero, the highest bidder wins!
            </Text>
          </li>
          <li>
            <Text fontSize="md">
              You may withdraw your bid if the starting price has NOT been met
            </Text>
          </li>
          <li>
            <Text fontSize="md">
              If you are out-bid, your current bid amount will be returned
              automatically
            </Text>
          </li>
        </ul>

        <Flex justifyContent="center" mt="2rem" alignContent={"center"}>
          <Flex maxWidth="80%" flexDirection="column">
            <Flex>
              <InputGroup size="lg">
                <Input
                  placeholder="Input Your Bid"
                  borderRadius={"1rem 0 0 1rem"}
                  type="number"
                  borderRight="0px"
                  onChange={(e) => {
                    if (bnbAmount > 0 || e.target.valueAsNumber >= 0) {
                      setBNBAmount(e.target.valueAsNumber);
                    }
                  }}
                />
              </InputGroup>

              <Button
                type="primary"
                colorScheme={"blue"}
                size="lg"
                minW="100px"
                borderRadius={"0 1rem 1rem 0"}
                isLoading={loading}
                disabled={bnbAmount <= 0}
                onClick={() => {
                  //console.log("Bidding", bnbAmount);
                  bidBNB();
                }}
              >
                BID
              </Button>
            </Flex>
            <Text>
              Current Highest Bid:{" "}
              <span style={{ color: "#ea8f08" }}>
                {auctionItem?.attributes?.highestBid}
              </span>
            </Text>
          </Flex>
        </Flex>

        <Button
          size="large"
          leftIcon={<AiOutlineCloseCircle />}
          colorScheme={"red"}
          style={{
            width: "100%",
            marginTop: "3rem",
            borderRadius: "0.5rem",
            paddingBlock: "0.75rem",
            fontSize: "20px",
            fontWeight: "500",
          }}
          isLoading={loading}
          onClick={() => {
            setOpenBNB(false);
            setBNBAmount(0);
            setTokenAmount(0);
          }}
        >
          Close
        </Button>
      </Modal>
      <Modal
        title={[<div className="modal-fixed-header">Place Your dGold Bid</div>]} ///-----------------------DGOLD (token) Modal
        visible={openDgold}
        footer={null}
        closable={false}
        centered={true}
        destroyOnClose={true}
        width="100%"
        style={{ minWidth: "350px", maxWidth: "500px" }}
      >
        <ul style={{ padding: "1rem" }}>
          <li>
            <Text fontSize="md">
              Your bid must be at minimum 1% higher than the current highest
              bid, unless there are no active bids
            </Text>
          </li>
          <li>
            <Text fontSize="md">
              A <span style={{ color: "#ea8f08" }}>24 hour</span> timer will
              begin once the starting price (reserve) has been met. This will
              reset with each new higher bid
            </Text>
          </li>
          <li>
            <Text fontSize="md">
              Your bid can be withdrawn if the auction has NOT gone live
            </Text>
          </li>
          <li>
            <Text fontSize="md">
              If you are out-bid, your current bid amount will be returned
              automatically
            </Text>
          </li>
        </ul>
        <Flex
          flexDir={"column"}
          border="1px solid #3f3f3f"
          padding="1rem"
          borderRadius="1rem"
          mb="2rem"
        >
          <ul style={{ paddingInline: "1rem" }}>
            <li>To use dGold, our contract must be approved to spend</li>
            <li>Current Approval must be higher than your desired bid</li>
          </ul>

          <Flex>
            <Input
              placeholder="Input approval increase"
              borderRadius={"1rem 0 0 1rem"}
              type="number"
              borderRight="0px"
              onChange={(e) => setApproval(e.target.value)}
            />
            <Button
              colorScheme={"green"}
              borderRadius={"0 1rem 1rem 0"}
              disabled={approval <= 0}
              isLoading={loading}
              onClick={() => handleIncreaseAmount()}
            >
              Approve +
            </Button>
          </Flex>
          <Text>
            {" "}
            *Current Approval:{" "}
            <span style={{ color: "#ea8f08" }}>
              {allowance.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              dG
            </span>
          </Text>
        </Flex>

        <Text>
          {" "}
          You can bid up to your current approval:
          <span style={{ color: "#ea8f08" }}>
            {" "}
            {allowance.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            dG
          </span>
        </Text>
        <Flex justifyContent="center" alignContent={"center"}>
          <Input
            size="lg"
            placeholder="Input Your Bid"
            borderRadius={"1rem 0 0 1rem"}
            type="number"
            borderRight="0px"
            //value={tokenAmount}
            //onChange={(e) => setTokenAmount(e.target.value)}
            onChange={(e) => {
              if (tokenAmount > 0 || e.target.valueAsNumber >= 0) {
                setTokenAmount(e.target.valueAsNumber);
              }
            }}
          />

          <Button
            type="primary"
            colorScheme={"blue"}
            size="lg"
            minW="100px"
            borderRadius={"0 1rem 1rem 0"}
            isLoading={loading}
            disabled={tokenAmount <= 0}
            onClick={() => {
              //console.log("Bidding", tokenAmount);
              bidDG();
            }}
          >
            BID
          </Button>
        </Flex>
        <Text color={"white"}>
          {" "}
          Current Highest Bid:{" "}
          <span style={{ color: "#ea8f08" }}>
            {(auctionItem?.attributes?.highestBid / 10 ** 9).toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}{" "}
            dG
          </span>
        </Text>

        <Button
          size="large"
          leftIcon={<AiOutlineCloseCircle />}
          colorScheme={"red"}
          style={{
            width: "100%",
            marginTop: "3rem",
            borderRadius: "0.5rem",
            paddingBlock: "0.75rem",
            fontSize: "20px",
            fontWeight: "500",
          }}
          isLoading={loading}
          onClick={() => {
            setOpenDgold(false);
            setBNBAmount(0);
            setTokenAmount(0);
          }}
        >
          Close
        </Button>
      </Modal>
      <Modal
        title={[<div className="modal-fixed-header">Buy Now</div>]} ///----------------------------Buy Now Modal
        visible={openBuyNow}
        footer={null}
        closable={false}
        centered={true}
        maskClosable
        destroyOnClose={true}
        width="100%"
        style={{ minWidth: "300px", maxWidth: "500px" }}
      >
        <Text>
          {" "}
          {isTokenAuction ? `dGold Listing` : `BNB Listing`} for{" "}
          {auctionItem?.attributes?.name} #{auctionItem?.attributes?.tokenId}
        </Text>
        <Text>
          {" "}
          Purchase this NFT for{" "}
          {isTokenAuction
            ? `${(buyNow / 10 ** 9).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })} dG`
            : `${(buyNow / 10 ** 18).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })} BNB`}
        </Text>
        {isTokenAuction && (
          <Text>
            Curent dGold spend allowance:{" "}
            <span
              style={{ color: buyNow / 10 ** 9 <= allowance ? "green" : "red" }}
            >
              {allowance.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>
          </Text>
        )}
        <Flex justifyContent="center" mt="2rem" alignContent={"center"}>
          <Flex maxWidth="80%">
            <Button
              type="primary"
              colorScheme={buyNow / 10 ** 9 <= allowance ? "green" : "blue"}
              size="lg"
              //minW="100px"
              //borderRadius={"0 1rem 1rem 0"}
              isLoading={loading}
              onClick={() => {
                handleBuyNowButton();
              }}
            >
              {isTokenAuction
                ? buyNow / 10 ** 9 <= allowance
                  ? `Purchase`
                  : `Increase Allowance`
                : `Purchase`}
            </Button>
          </Flex>
        </Flex>

        <Button
          size="large"
          leftIcon={<AiOutlineCloseCircle />}
          colorScheme={"red"}
          style={{
            width: "100%",
            marginTop: "3rem",
            borderRadius: "0.5rem",
            paddingBlock: "0.75rem",
            fontSize: "20px",
            fontWeight: "500",
          }}
          isLoading={loading}
          onClick={() => {
            setOpenBuyNow(false);
          }}
        >
          Close
        </Button>
      </Modal>
    </>
  );
};

export default InfoPage;
