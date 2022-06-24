import React, { useEffect, useState } from "react";
import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Text,
  Flex,
  Spacer,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import { Oval } from "react-loader-spinner";
import { useMoralisQuery } from "react-moralis";
import { getRarityName } from "./types";
import { useNft } from "hooks/useNft";
import { useStakingRouter } from "hooks/useStakingRouter";
import {
  dGOLDAddress,
  licksAddress,
  stakingRouterAddress,
  affinityAddress,
} from "contracts";
import "./style.css";

export default function StakingModal({
  nftType,
  rarity,
  awardIsDGOLD,
  fetchPoolData,
}) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const rarityName = getRarityName(rarity);
  const textInfo = "#ea8f08";
  const [loading, setLoading] = useState(false);
  const [loadingStake, setloadingStake] = useState(false);
  const [changed, setChanged] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [stakedNfts, setStakedNfts] = useState([]);
  const [availableNFTSelected, setAvailableNFTSelected] = useState([]);
  const [stakedNFTSelected, setStakedNFTSelected] = useState([]);
  const queryMarketItems = useMoralisQuery("AuctionListing");
  const fetchMarketItems = JSON.parse(
    JSON.stringify(queryMarketItems.data, [
      "objectId",
      "createdAt",
      "isLive",
      "nftContractAddress",
      "sold",
      "tokenId",
      "nftSeller",
      "confirmed",
      "canceled",
    ])
  );

  const rewardToken = awardIsDGOLD ? dGOLDAddress : affinityAddress;
  // const rewardTokenDecimals = awardIsDGOLD ? dGoldDecimals : 0;
  const { getNftsByTier, getNftsByIds, isApprovedForAll, approveNfts } = useNft(
    {
      token_address: licksAddress,
    }
  );
  const {
    getStakedTokenIds,
    stakeNfts,
    getFeeForLockedNft,
    unStakeNfts,
    getPoolInfo,
  } = useStakingRouter();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  function NFT({ nft, selected }) {
    //console.log(nft);

    const getMarketItem = (nft) => {
      const result = fetchMarketItems?.find(
        (e) =>
          e.nftContractAddress === nft?.token_address &&
          e.tokenId === nft?.token_id &&
          e.sold !== true &&
          //e.confirmed === true &&
          e.canceled !== true
      );
      if (result) console.log("ON MARKET");

      return result;
    };

    return (
      <Flex
        direction={"row"}
        p="2"
        align="center"
        justifyContent={"center"}
        items="center"
        borderRadius="xl"
        _hover={{ background: "#242222" }}
        gap="2"
        background={selected ? "#04aa6d" : ""}
      >
        {nft?.tokenId ? (
          <Flex direction={"column"}>
            <Text>LICK #{nft?.tokenId}</Text>

            {nft?.lockTime ? (
              <Text>Locked for</Text>
            ) : getMarketItem(nft) ? (
              <Text color="yellow">On Market</Text>
            ) : (
              <Text>Available</Text>
            )}
            {nft?.lockTime ? (
              <Text>
                <span style={{ color: textInfo }}>{nft?.lockTime}</span> Days
              </Text>
            ) : null}
          </Flex>
        ) : (
          <Flex direction={"column"}>
            <Text>LICK #{nft?.token_id}</Text>

            {nft?.lockTime ? (
              <Text>Locked for</Text>
            ) : getMarketItem(nft) ? (
              <Text color="yellow">On Market</Text>
            ) : (
              <Text>Available</Text>
            )}
            {nft?.lockTime ? (
              <Text>
                <span style={{ color: textInfo }}>{nft?.lockTime}</span> Days
              </Text>
            ) : null}
          </Flex>
        )}
        <img
          className="nft"
          src={nft?.image}
          alt="NFT"
          height={"auto"}
          width={60}
        ></img>
      </Flex>
    );
  }

  async function fetchData() {
    setLoading(true);
    const tier = getRarityName(rarity);

    const stakedTokenIds = await getStakedTokenIds(
      nftType.address,
      rewardToken,
      tier
    );

    const nftsByTier = await getNftsByTier(tier);
    //console.log(nftsByTier);
    setNfts(nftsByTier);

    if (stakedTokenIds.length === 0) {
      setStakedNfts(stakedTokenIds);
    } else {
      const stakedNfts = await getNftsByIds(stakedTokenIds);
      const lockTimes = await getPoolInfo(nftType.address, rewardToken, tier);
      //console.log(lockTimes[4]);
      //console.log(lockTimes[4].length);

      for (let i = 0; i < lockTimes[4].length; i++) {
        stakedNfts[i].lockTime = (lockTimes[4][i] / 86400).toFixed(2);
      }
      setStakedNfts(stakedNfts);
    }

    setAvailableNFTSelected(new Array(nftsByTier.length).fill(false));
    setStakedNFTSelected(new Array(stakedNfts.length).fill(false));

    setLoading(false);
  }

  function handleAvailableNFTClick(index) {
    const newArrayState = availableNFTSelected;
    newArrayState[index] = !newArrayState[index];
    setAvailableNFTSelected(newArrayState);
    setChanged(!changed);
  }
  function handleStakedNFTClick(index) {
    const newArrayState = stakedNFTSelected;
    newArrayState[index] = !newArrayState[index];
    setStakedNFTSelected(newArrayState);
    setChanged(!changed);
  }

  async function handleStakeNFTs(all) {
    setloadingStake(true);
    const selectedNftIds = [];
    if (all) {
      nfts.forEach((nft) => {
        selectedNftIds.push(nft.token_id);
      });
    } else {
      availableNFTSelected.forEach((nftSelected, i) => {
        if (nftSelected) selectedNftIds.push(nfts[i].token_id);
      });
    }
    //console.log(selectedNftIds);
    if (selectedNftIds.length > 0) {
      try {
        // await approveToken(stakingRouterAddress, 100);
        console.log("Checking Approval");

        //Check approved to staking Router
        const isApproved = await isApprovedForAll(stakingRouterAddress);
        console.log({ isApproved });
        if (!isApproved) {
          const approveResult = await approveNfts(stakingRouterAddress, true);
          if (!approveResult) {
            alert("You must approve nfts to router");
            return;
          }
        }
        const res = await stakeNfts(
          nftType.address,
          rewardToken,
          rarityName.toLowerCase(),
          selectedNftIds
        );
        if (res) {
          //alert("Stake Succcessfully");
          toast({
            description: `Staking was successful!`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          fetchData();
          fetchPoolData();
          setloadingStake(false);
        }
      } catch (err) {
        alert(err.message);
        setloadingStake(false);
      }
    } else {
      alert("No NFTs are selected");
    }
  }

  async function handleUnstakeNFTs(all) {
    setloadingStake(true);
    const selectedNftIds = [];
    const lockedNFTs = [];
    // await approveToken("0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3", 100);
    if (all) {
      stakedNfts.forEach((nft) => {
        //selectedNftIds.push(nft.token_id);
        //console.log(nft.lockTime);
        if (nft.lockTime > 0) {
          lockedNFTs.push(nft);
        }

        selectedNftIds.push(nft.tokenId);
      });
    } else {
      stakedNFTSelected.forEach((nftSelected, i) => {
        if (stakedNfts[i].lockTime > 0) {
          lockedNFTs.push(stakedNfts[i]);
        }
        if (nftSelected) selectedNftIds.push(stakedNfts[i].tokenId);
        //console.log(stakedNfts[i]);
      });
    }

    if (selectedNftIds.length > 0) {
      try {
        const feeForLocked = await getFeeForLockedNft();
        const totalFee = feeForLocked * lockedNFTs.length;
        // await approveNfts(stakingRouterAddress, selectedNftIds);
        //console.log(totalFee);
        const res = await unStakeNfts(
          nftType.address,
          rewardToken,
          rarityName.toLowerCase(),
          selectedNftIds,
          totalFee
        );
        if (res) {
          //alert("Unstake Succcessfully");
          toast({
            description: `Unstaking was successful!`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          setloadingStake(false);
          fetchData();
          fetchPoolData();
        }
      } catch (err) {
        toast({
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setloadingStake(false);
        fetchData();
        fetchPoolData();
      }
    } else {
      alert("No NFTs are selected");
    }
  }
  return (
    <>
      <Button colorScheme="blue" onClick={onOpen}>
        STAKE
      </Button>

      <Modal
        blockScrollOnMount={true}
        isOpen={isOpen}
        onClose={onClose}
        colorScheme="blue"
        size={"6xl"}
      >
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent
          backgroundColor="rgba(1, 1, 1, 0.8)"
          backdropFilter="saturate(180%) blur(5px)"
        >
          <ModalBody>
            {nfts.length ? (
              <Flex
                direction="column"
                px="4"
                pb="12"
                borderBottomColor="#141414"
                borderBottomWidth="medium"
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={"2xl"} align="center" p="2">
                  Available {rarityName} NFTs
                </Text>
                {loading ? (
                  <Oval color="#00BFFF" height={80} width={80} />
                ) : (
                  <SimpleGrid
                    //columns={{ base: 2, md: 4 }}
                    autoColumns
                    minChildWidth={"152px"}
                    background={"#141414"}
                    borderRadius="xl"
                    gap="1"
                    p="1"
                    width="100%"
                    overflow="visible"
                  >
                    {nfts.map((nft, i) => {
                      return (
                        <button
                          key={i}
                          //disabled={true}
                          onClick={() => handleAvailableNFTClick(i)}
                        >
                          <NFT
                            index={i}
                            nft={nft}
                            staked={false}
                            selected={availableNFTSelected[i]}
                          />
                        </button>
                      );
                    })}
                  </SimpleGrid>
                )}
                <Text color="white" pt={4}>
                  Select from your available NFTs and stake them into this pool
                </Text>
                <Text align={"center"} color="#E2841F">
                  STAKING WILL CLAIM PENDING REWARDS
                </Text>
                <Flex pb={2} pt={2} width="auto">
                  <Button
                    mx={2}
                    colorScheme="blue"
                    onClick={() => handleStakeNFTs(false)}
                  >
                    Stake
                  </Button>
                  <Spacer />
                  <Button
                    mx={2}
                    colorScheme="blue"
                    onClick={() => handleStakeNFTs(true)}
                  >
                    Stake All
                  </Button>
                  <Button
                    mx={2}
                    colorScheme="green"
                    onClick={() => fetchData()}
                  >
                    Refresh
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <Flex
                direction="column"
                px="4"
                py="6"
                borderBottomColor="#141414"
                borderBottomWidth="medium"
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={"2xl"} align="center" p="2">
                  No {rarityName} NFTs Available
                </Text>
              </Flex>
            )}
            {stakedNfts.length ? (
              <Flex
                direction="column"
                mx="4"
                mt="12"
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={"2xl"} align="center" p="2">
                  Staked {rarityName} NFTs
                </Text>
                {loading ? (
                  <Oval color="#00BFFF" height={80} width={80} />
                ) : (
                  <SimpleGrid
                    //columns={{ base: 2, md: "autoColumns" }}
                    autoColumns
                    minChildWidth={"152px"}
                    background={"#141414"}
                    borderRadius="xl"
                    gap="1"
                    p="1"
                    width="full"
                    overflow="visible"
                  >
                    {stakedNfts.map((nft, i) => {
                      return (
                        <button key={i} onClick={() => handleStakedNFTClick(i)}>
                          <NFT
                            index={i}
                            nft={nft}
                            staked={true}
                            selected={stakedNFTSelected[i]}
                          />
                        </button>
                      );
                    })}
                  </SimpleGrid>
                )}
                <Text color="white" pt={4}>
                  Select from your staked NFTs to remove them from the pool
                  <br /> A 0.1 BNB fee applies to each NFT IF within 30 days of
                  staking
                </Text>
                <Text align={"center"} color="#E2841F">
                  UNSTAKING WILL CLAIM PENDING REWARDS
                </Text>
                <Flex pb={2} pt={2} width="auto">
                  <Button
                    colorScheme="blue"
                    isLoading={loadingStake}
                    onClick={() => handleUnstakeNFTs(false)}
                  >
                    Remove
                  </Button>
                  <Spacer />
                  <Button
                    mx={6}
                    colorScheme="blue"
                    isLoading={loadingStake}
                    onClick={() => handleUnstakeNFTs(true)}
                  >
                    Remove All
                  </Button>
                  <Spacer />
                  <Button
                    colorScheme="red"
                    isLoading={loadingStake}
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <Flex
                direction="column"
                px="4"
                py="6"
                //borderBottomColor="#141414"
                //borderBottomWidth="medium"
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={"2xl"} align="center" p="2">
                  No {rarityName} NFTs Staked
                </Text>
                <Button colorScheme="red" onClick={onClose}>
                  Cancel
                </Button>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
