import React, { useState, useEffect } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { Input, Menu, Layout } from "antd";
import { Link, useRouteMatch, useHistory } from "react-router-dom";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import {
  Box,
  Flex,
  Heading,
  Text,
  Center,
  Button,
  Badge,
  Stack,
  HStack,
  Link as ExtLink,
  Image as CImage,
  Avatar,
  AvatarBadge,
  ButtonGroup,
  IconButton,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useClipboard,
  useToast,
  Skeleton,
  StackDivider,
  VStack,
  SimpleGrid,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
//import StickyBox from "react-sticky-box";
import Sticky from "react-stickynode";
import { TwitterIcon, TwitterShareButton } from "react-share";
import Failed from "../images/Failed.jpg";
import Loader from "../images/Loader.svg";
import Sidebar from "./Sidebar/Sidebar";
import { filterByNames } from "./Filter";
//Timer
import Countdown, { zeroPad } from "react-countdown";
import "../style.css";
//ICONS
import { TriangleDownIcon } from "@chakra-ui/icons";
import { MdVerified } from "react-icons/md";
import { CgWebsite } from "react-icons/cg";
import { BsShareFill } from "react-icons/bs";
import { FiLink } from "react-icons/fi";
import { SiBinance } from "react-icons/si";

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "center",
    marginInline: "auto",
    //maxWidth: "1400px",
    width: "100%",
    gap: "15px",
    paddingInline: "1rem",
    paddingTop: "1rem",
    paddingBottom: "4rem",
    border: "2px soild #151618",
  },
  buttonContainer: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "center",
    marginInline: "auto",
    maxWidth: "1400px",
    gap: "15px",
    paddingInline: "0.25rem",
    marginBottom: "2rem",
  },
};

const CollectionPage = (props) => {
  const history = useHistory();
  let { url } = useRouteMatch();
  const toast = useToast();
  const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
  const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
  const shareURL = window.location.href;
  const collection = props.match.params.collection;
  const mintable = [
    "0x09efd51515c0fa0a9e87125dec184de59ea1e553",
    "0x8db96c06e9e0d04b8377643f325ec342a3693a14",
    "0xa36c806c13851f8b27780753563fddaa6566f996",
  ];
  const { Moralis, isInitialized } = useMoralis();
  const [display, setDisplay] = useState(12);
  const [loading, setLoading] = useState(true);

  const [traitType, setTraitType] = useState("");
  const [traitValue, setTraitValue] = useState("");

  const [salesDisplay, setSalesDisplay] = useState(false);

  const [floorBNB, setFloorBNB] = useState(0);
  const [floorDG, setFloorDG] = useState(0);

  const [collectionDetails, setCollectionDetails] = useState(); /// Orig = empty obj
  const [nftDisplay, setNFTDisplay] = useState([]);
  const nftSkeleton2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [nftsToDisplay, setNftsToDisplay] = useState([nftSkeleton2]);

  const { hasCopied, onCopy } = useClipboard(window.location.href);

  const [filter, setFilter] = useState();
  const [sortKey, setSortKey] = useState("token_id");
  const [sortOrder, setSortOrder] = useState("desc");

  const [currentNFTs, setCurrentNFTs] = useState([]);
  const [onSale, setSales] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [bnbVolArr, setBNBVolArr] = useState([]);
  const [dgVolArr, setDGVolArr] = useState([]);
  const [viewBNBFloor, setViewBNBFloor] = useState(true);
  const [viewBNBVol, setViewBNBVol] = useState(true);

  const [value, setValue] = React.useState("");

  const queryMarketItems = useMoralisQuery("AuctionListing");
  const fetchMarketItems = JSON.parse(
    JSON.stringify(queryMarketItems.data, [
      "nftContractAddress",
      "sold",
      "tokenId",
      "confirmed",
      "canceled",
      "erc20Token",
      "minPrice",
      "isLive",
      "highestBid",
      "auctionEndUnix",
    ])
  );

  // Timer End Component
  const Completionist = () => {
    return (
      <Center>
        <Text color={"yellow"}>This Auction has ended</Text>
      </Center>
    );
  };
  // Renderer callback with condition
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return (
        <Center>
          <Text color={"white"} mr={2}>
            Ending:
          </Text>
          <Text color="#ea8f08" fontSize="14px" alignSelf={"center"}>
            {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
          </Text>
        </Center>
      );
    }
  };

  function increaseDisplay() {
    setDisplay(display + 12);
  }

  //---------------------------------------Get NFTS from DB
  useEffect(() => {
    async function fetchData() {
      //var t0 = performance.now();
      if (!isInitialized) {
        Moralis.start({ serverUrl, appId });
      }
      //Moralis Cloud Functions
      const params = { address: collection };
      const details = await Moralis.Cloud.run("details", params);
      setCollectionDetails(details[0]?.attributes);
      const nfts = await Moralis.Cloud.run("cloudNFTs", params);
      setCurrentNFTs(nfts);
      setNftsToDisplay(nfts);
      setNFTDisplay(nfts);
      setLoading(false);
      //var t1 = performance.now();
      //console.log("Fetch took " + (t1 - t0) + " milliseconds.");
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  function isMintable(address) {
    if (mintable.includes(address)) {
      return true;
    }
    return false;
  }

  //****COLLECTION DETAILS DISPLAY--banner, logo, etc..
  function Details({ collection }) {
    const loading = collection ? false : true;
    return (
      <Center
        flexDirection={"column"}
        width="full"
        maxWidth="100%"
        height="auto"
        mt={20}
      >
        <CImage
          className="banner-shadow"
          h={"200px"}
          w={"full"}
          src={collection?.banner}
          objectFit="cover"
          //mt={4}
        />
        <Flex justify={"center"}>
          <Avatar
            size={"2xl"}
            mt={-16}
            src={collection?.logo}
            alt={"Author"}
            css={{
              border: "2px solid white",
            }}
          >
            {collection?.verified && (
              <AvatarBadge
                //borderColor="papayawhip"
                border="0px"
                bg="white"
                boxSize="0.8em"
                //padding="0.1em"
              >
                <MdVerified color="#2081e2" />
              </AvatarBadge>
            )}
          </Avatar>
        </Flex>
        <Heading my={2} fontSize={{ base: "2.5rem", sm: "4rem" }} color="white">
          {loading ? `Loading..` : collection?.name}
        </Heading>
        <Text
          align={"center"}
          mt={2}
          //mb={6}
          px={4}
          color="white"
          maxWidth="650px"
        >
          {collection?.description}
        </Text>
      </Center>
    );
  }

  //****SKELETON LOADER
  function NFTSkeleton({ index }) {
    return (
      <Box
        w={{ base: "100%", sm: "250px" }}
        rounded="20px"
        overflow="hidden"
        bg={"#303339"}
        mt={4}
        key={index}
      >
        <CImage
          src={Loader}
          alt="Loading"
          align={"center"}
          style={{ margin: "auto" }}
          fit="contain"
        />
        <Box p={4}>
          <Stack>
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
          </Stack>
        </Box>
      </Box>
    );
  }

  const currentDisplay = filterByNames(nftsToDisplay, value);
  const filters = {
    TRAIT_TYPE: [traitType],
    VALUE: [traitValue],
  };
  //console.log(currentNFTs[0]);

  //****DISPLAY ARR FOR FILTERED NFTS USING ATTRIBUTES
  const allNFTs = currentNFTs[0]?.attributes
    ? nftDisplay.filter((d) => {
        let traitTypePasses = false;
        let traitValuePasses = false;

        for (let filter in filters) {
          if (filter === "TRAIT_TYPE") {
            let traits = d.attributes.filter((a) =>
              filters[filter].includes(a.trait_type)
            );

            traitTypePasses = traits.length > 0;
          }

          if (filter === "VALUE") {
            let traits = d.attributes.filter((a) =>
              filters[filter].includes(a.value)
            );

            traitValuePasses = traits.length > 0;
          }
        }
        if (filters.VALUE != "") {
          return [traitTypePasses, traitValuePasses].every((p) => p);
        }
        return nftDisplay;
      })
    : nftDisplay;

  //*****NFT LAYOUT
  function NFT({ nft }) {
    const [image, setImage] = useState(nft?.image);
    const marketItem = getMarketItem(nft);
    const isTokenListing =
      marketItem?.erc20Token == "0x0000000000000000000000000000000000000000"
        ? false
        : true;

    if (loading)
      return (
        <Stack>
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack>
      );
    return (
      <Box
        position="relative"
        w={{ base: "175px", sm: "250px" }}
        rounded="10px"
        overflow="hidden"
        bg={"#303339"}
        boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.5)"
        _hover={{ boxShadow: "0 5px 12px 4px rgba(0, 0, 0, 1)" }}
        mt={4}
        //key={index}
      >
        <Box as={Link} to={`${url}/${nft?.token_id}`}>
          <CImage
            src={image}
            alt="Card Image"
            align={"center"}
            style={{ margin: "auto" }}
            fit="contain"
            onError={() => {
              setImage(Failed);
            }}
            fallbackSrc={Loader}
          />
        </Box>

        <Countdown
          date={marketItem?.auctionEndUnix * 1000}
          renderer={renderer}
        />
        <Center flexDirection={"column"} padding={2}>
          <Text
            //as="h1"
            className="nft-name-text"
            //fontSize={{ base: "12px", sm: "xl" }}
            color={"white"}
            fontWeight="normal"
            marginBlock={marketItem ? "0px" : "1rem"}
          >
            {nft?.metadata?.name}
          </Text>
          {marketItem && (
            <Flex flexDirection={{ base: "column", sm: "row" }} width="full">
              {isTokenListing ? (
                <Text color={"gray"} marginLeft="5px">
                  {marketItem.highestBid > 0
                    ? `Current Bid: ${(
                        marketItem.highestBid /
                        10 ** 9
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })} dG`
                    : `Starting: ${(
                        marketItem.minPrice /
                        10 ** 9
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })} dG`}
                </Text>
              ) : (
                <Text color={"gray"} marginLeft="5px">
                  {marketItem.highestBid > 0
                    ? `Current Bid: ${marketItem.highestBid / 10 ** 18} BNB`
                    : `Starting: ${marketItem.minPrice / 10 ** 18} BNB`}
                </Text>
              )}
              {marketItem && !marketItem.isLive && (
                <Badge
                  marginLeft="auto"
                  marginRight="5px"
                  marginBottom="5px"
                  color="black"
                  variant="solid"
                  colorScheme="yellow"
                  rounded="full"
                  px={2}
                >
                  On Market
                </Badge>
              )}
              {marketItem && marketItem.isLive && (
                <Badge
                  marginLeft="auto"
                  marginRight="5px"
                  marginBottom="5px"
                  color="black"
                  variant="solid"
                  colorScheme="green"
                  rounded="full"
                  px={2}
                >
                  Live
                </Badge>
              )}
            </Flex>
          )}
        </Center>
      </Box>
    );
  }

  useEffect(() => {
    if (!collection) return;
    sales();
  }, [collection]);

  //****GET SALES INFO FROM MORALIS DB
  async function sales() {
    let floorBNB = [];
    let floorDG = [];
    let soldValuesBNB = [];
    let soldValuesDG = [];
    let onsale = [];
    const address = collection;
    const query = new Moralis.Query("AuctionListing");
    query.limit(1000);
    query.equalTo("nftContractAddress", address);
    query.notEqualTo("canceled", true);
    query.notEqualTo("minPrice", "0");
    query.equalTo("confirmed", true);
    query.descending("createdAt");
    const results = await query.find();

    for (let i = 0; i < results.length; i++) {
      if (!results[i].attributes.sold) {
        onsale.push(results[i].attributes);
      }

      if (
        results[i].attributes.sold == true &&
        results[i].attributes.salePriceBNB
      ) {
        soldValuesBNB.push(results[i].attributes.salePriceBNB / 10 ** 18);
      }
      if (
        results[i].attributes.sold == true &&
        results[i].attributes.salePriceDgold
      ) {
        soldValuesDG.push(results[i].attributes.salePriceDgold / 10 ** 9);
      }

      if (
        !results[i].attributes.sold &&
        results[i].attributes.erc20Token ==
          "0x0000000000000000000000000000000000000000"
      )
        floorBNB.push(results[i].attributes.minPrice / 10 ** 18);

      if (
        !results[i].attributes.sold &&
        results[i].attributes.erc20Token !=
          "0x0000000000000000000000000000000000000000"
      )
        floorDG.push(results[i].attributes.minPrice / 10 ** 9);
    }
    setSales(onsale);
    setFloorBNB(floorBNB);
    setFloorDG(floorDG);
    setBNBVolArr(soldValuesBNB);
    setDGVolArr(soldValuesDG);
  }

  function volume(array) {
    let start = 0;
    array.forEach((element) => {
      start = start + Number(element);
    });
    return start;
  }

  //****VIEW ALL BUTTON--from sidebar
  const viewAll = async () => {
    setTraitValue("");
    setTraitType("");
    setValue("");
    setNFTDisplay(currentNFTs);
  };

  //****VIEW SALES BUTTON--from sidebar
  const getSaleItems = async () => {
    let sales = [];
    for (let i = 0; i < currentNFTs.length; i++) {
      if (getMarketItem(currentNFTs[i])) {
        sales.push(currentNFTs[i]);
      }
    }
    for (let NFT of sales) {
      const marketInfo = getMarketItem(NFT);
      NFT.price = marketInfo.highestBid * 1;
      NFT.seller = marketInfo.nftSeller;
      NFT.blockTimestamp = marketInfo.block_timestamp;
    }
    //console.log(sales);
    setSaleItems(sales);
    setNftsToDisplay(sales);
    setNFTDisplay(sales);
  };

  //****COMPARE EACH NFT TO MORALIS DB FOR A LISTING
  const getMarketItem = (nft) => {
    const result = fetchMarketItems?.find(
      (e) =>
        e.nftContractAddress === nft?.address?.toLowerCase() &&
        e.tokenId === nft?.tokenId &&
        e.sold != true &&
        e.confirmed === true &&
        e.canceled != true &&
        e.minPrice != 0
    );
    //console.log(result);
    return result;
  };

  //****COLLECTION SHARE BUTTON --- could be separated
  function ShareButton({ info }) {
    return (
      <Tooltip hasArrow label="Share Options" bg="gray.600" placement="top">
        <Flex justifyContent="center">
          <Popover placement="bottom" isLazy>
            <PopoverTrigger>
              <IconButton
                aria-label="More server options"
                icon={<BsShareFill />}
                variant="outline"
                color="white"
                _hover={{
                  color: "black",
                  background: "white",
                }}
                w="fit-content"
              />
            </PopoverTrigger>

            <PopoverContent
              w="fit-content"
              backgroundColor={"#303339"}
              color="white"
              _focus={{
                boxShadow: "md",
                background: "#303339",
                color: "white",
              }}
            >
              <PopoverArrow />
              <PopoverBody>
                <Stack divider={<StackDivider borderColor="gray.200" />}>
                  <Button
                    w="full"
                    variant="ghost"
                    leftIcon={<FiLink />}
                    justifyContent="space-between"
                    fontWeight="normal"
                    fontSize="sm"
                    onClick={() => {
                      onCopy();
                      toast({
                        description: "URL Copied",
                        //variant: "left-accent",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                    _hover={{
                      background: "gray.900",
                    }}
                  >
                    Copy Link
                  </Button>

                  <TwitterShareButton
                    title={"Check out this NFT Collection on NFTGold!"}
                    url={shareURL}
                    via={"DeviousLicks"}
                    hashtags={["NFTGold"]}
                  >
                    <Flex justifyContent={"space-between"} align="center">
                      <TwitterIcon size={32} round />
                      <Text ml={2}>Twitter Share</Text>
                    </Flex>
                  </TwitterShareButton>
                </Stack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
      </Tooltip>
    );
  }

  //****MINT BUTTON FOR COLLECTION -- directs to mint page if exists
  const handleMinter = () => {
    if (collection == "0x8db96c06e9e0d04b8377643f325ec342a3693a14") {
      history.push(`/minter/devious`);
    } else if (collection == "0xa36c806c13851f8b27780753563fddaa6566f996")
      history.push(`/minter/moneymonkeys`);
    else {
      history.push(`/minter/affinity`);
    }
  };

  const handleChange = (event) => setValue(event.target.value);

  //****ASCENDING/DESCENDING SORTING OF NFTS
  const sortDynamic = (key, order = "asc") => {
    const sortOrder = order === "asc" ? 1 : -1;
    return (a, b) => {
      const A = typeof a[key] === "string" ? a[key].toUpperCase() : a[key];
      const B = typeof b[key] === "string" ? b[key].toUpperCase() : b[key];
      if (A < B) {
        return sortOrder * -1;
      } else if (A > B) {
        return sortOrder * 1;
      } else {
        return 0;
      }
    };
  };

  //****COLLECTION STATS LAYOUT
  const Stats = () => {
    return (
      <SimpleGrid
        columns={3}
        spacing={0}
        border="2px solid #303339"
        borderRadius={8}
        mt={{ base: 4, sm: 8 }}
        mb={4}
      >
        {/* <Flex border="2px solid #303339" borderRadius="1rem" p={2}> */}
        <Center flexDirection="column" p={2}>
          <Center>
            <Heading color="yellow.500">{onSale.length}</Heading>
          </Center>
          <Text fontSize="md" color="gray">
            On Sale
          </Text>
        </Center>
        <Center
          flexDirection="column"
          py={2}
          px={4}
          borderInline="2px solid #303339"
        >
          <Center>
            <Heading mr={2} size="md" color="gray">
              {viewBNBFloor ? <SiBinance /> : null}
            </Heading>
            <Heading
              color="yellow.500"
              onClick={() => setViewBNBFloor(!viewBNBFloor)}
              cursor="pointer"
            >
              {viewBNBFloor
                ? floorBNB.length
                  ? Math.min(...floorBNB)
                  : `--`
                : floorDG.length
                ? Math.min(...floorDG).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : `--`}
            </Heading>
          </Center>
          <Text fontSize="md" color="gray">
            Floor Price {viewBNBFloor ? null : `dG`}
          </Text>
        </Center>
        <Center flexDirection="column" p={2}>
          <Center>
            <Heading mr={2} size="md" color="gray">
              {viewBNBVol ? <SiBinance /> : null}
            </Heading>
            <Heading
              color="yellow.500"
              onClick={() => setViewBNBVol(!viewBNBVol)}
              cursor="pointer"
            >
              {viewBNBVol
                ? volume(bnbVolArr).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : volume(dgVolArr).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
            </Heading>
          </Center>
          <Text fontSize="md" color="gray">
            Trade Volume {viewBNBVol ? null : `dG`}
          </Text>
        </Center>
        {/* </Flex> */}
      </SimpleGrid>
    );
  };

  //****MAIN COLLECTION PAGE DISPLAY
  return (
    <>
      <Center
        flexDirection={"column"}
        //pt={20}
        backgroundColor="#202225"
        //paddingInline="2rem"
        width="100%"
      >
        <Details collection={collectionDetails} />
        <Stats />
        <Flex style={styles.buttonContainer}>
          <ButtonGroup>
            <Tooltip
              hasArrow
              label={collectionDetails?.website}
              bg="gray.600"
              placement="top"
            >
              <Button
                as={ExtLink}
                aria-label="Website"
                variant="outline"
                color={"white"}
                fontWeight="400"
                href={collectionDetails?.website}
                target="_blank"
                rel="noopener noreferrer"
                isExternal
                _hover={{
                  color: "black",
                  background: "white",
                  textDecor: "none",
                }}
                icon={<CgWebsite />}
              >
                {" "}
                Website
              </Button>
            </Tooltip>
            {collection && isMintable(collection) && (
              <Tooltip
                hasArrow
                label="Mint a new NFT"
                bg="gray.600"
                placement="top"
              >
                <Button
                  variant="outline"
                  colorScheme={"green"}
                  onClick={handleMinter}
                >
                  Mint
                </Button>
              </Tooltip>
            )}
            <Tooltip
              hasArrow
              label="View Contract"
              bg="gray.600"
              placement="top"
            >
              <Button
                as={ExtLink}
                aria-label="Website"
                variant="outline"
                color={"white"}
                fontWeight="400"
                href={`https://bscscan.com/address/${collectionDetails?.address}`}
                target="_blank"
                rel="noopener noreferrer"
                isExternal
                _hover={{
                  color: "black",
                  background: "white",
                  textDecor: "none",
                }}
              >
                Contract
              </Button>
            </Tooltip>
            <Tooltip
              hasArrow
              label="Share Options"
              bg="gray.600"
              placement="top"
            >
              <ShareButton info={collectionDetails} />
            </Tooltip>
          </ButtonGroup>
        </Flex>

        <Flex
          //pos="relative"
          className="nft-container-shadow"
          flexDir={{ base: "column", sm: "row" }}
          alignItems="flex-start"
          width="100%"
          border={{ base: "none", sm: "2px solid #151618" }}
        >
          <Sidebar
            collection={collection}
            logo={collectionDetails?.logo}
            name={collectionDetails?.name}
            filter={setSortKey}
            order={setSortOrder}
            sales={onSale.length}
            all={currentNFTs.length}
            nfts={currentNFTs}
            saleItems={getSaleItems}
            value={value}
            viewAll={viewAll}
            setValue={setValue}
            setTraitValue={setTraitValue}
            setTraitType={setTraitType}
            filterAmount={allNFTs.length}
            currentFilter={traitValue}
          />
          <Box>
            {value != "" && (
              <Tag
                size="lg"
                //key={size}
                margin={6}
                borderRadius="full"
                variant="solid"
                colorScheme="green"
                onClick={() => {
                  setValue("");
                }}
              >
                <TagLabel>Search: {value}</TagLabel>
                <TagCloseButton />
              </Tag>
            )}
            {filters.TRAIT_TYPE != "" && (
              <Tag
                size="lg"
                //key={size}
                margin={6}
                borderRadius="full"
                variant="solid"
                colorScheme="green"
                onClick={() => {
                  setTraitValue("");
                  setTraitType("");
                }}
              >
                <TagLabel>
                  {filters.TRAIT_TYPE}: {filters.VALUE}
                </TagLabel>
                <TagCloseButton />
              </Tag>
            )}
            <Box className="nft-display">
              {loading &&
                nftSkeleton2.map((nft) => <NFTSkeleton index={nft} />)}

              {collection !== "explore" &&
                salesDisplay != true &&
                filterByNames(allNFTs, value)
                  ?.sort(sortDynamic(sortKey, sortOrder))
                  .slice(0, display)
                  .map((nft, index) => (
                    <Skeleton isLoaded={!loading}>
                      <NFT nft={nft} index={nft.tokenId} />
                    </Skeleton>
                  ))}
              {filterByNames(allNFTs, value).length > display && (
                <Button
                  className="loader-button"
                  variant="outline"
                  color={"gray"}
                  mt={8}
                  leftIcon={<TriangleDownIcon />}
                  rightIcon={<TriangleDownIcon />}
                  onClick={() => {
                    increaseDisplay();
                  }}
                >
                  Load More NFTs
                </Button>
              )}
            </Box>
          </Box>
        </Flex>
      </Center>
    </>
  );
};

export default CollectionPage;
