import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import {
  BrowserRouter as Router,
  NavLink as ReactLink,
  Switch,
  Route,
  useLocation,
} from "react-router-dom";
import Account from "components/Account";
import NFTBalance from "components/NFTBalance";
import CollectionPage from "components/CollectionPage";
import NFTTokenIds from "components/NFTTokenIds";
import Minter from "components/Minter/Minter";
import InfoPage from "components/NFTInfo/InfoPage";
import Staking from "components/Staking/Staking";
import Landing from "./components/LandingPage/Landing";
import LicksStaking from "components/Staking/LicksStaking";
import Dashboard from "components/Staking/StakingDashboard";
import Auction from "components/NFTInfo/AuctionListing";
import TokenPrice from "components/TokenPrice";
import "antd/dist/antd.css";
import "./style.css";
import MyActivity from "components/MyTransactions/NFTMarketTransactions";
import DisplayFAQ from "components/FAQs";
import {
  Box,
  Image,
  Flex,
  HStack,
  Link,
  IconButton,
  useDisclosure,
  Center,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import Logos from "./images/Logo256.png";
import FooterLogo from "./images/MarketFooterLogo.png";
import DGOLD from "./images/Logo256.png";
import MarketLogo from "./images/MarketLogo.png";
import StakingBaner from "./images/StakingBanner.png";
import { Copyright } from "components/Copyright";
import { SocialMediaLinks } from "components/SocialMediaLinks";
import ExploreNFTs from "components/ExploreNFTs";

const styles = {
  content: {
    display: "flex",
    height: "auto",
    minHeight: "92vh",
    justifyContent: "center",
    fontFamily: "Roboto, sans-serif",
    color: "#041836",

    background: "rgba(15, 15, 15, 1)",
  },
  header: {
    position: "fixed",
    zIndex: 1,
    width: "100%",
    background: "#333",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif",
    borderTop: "12px solid rgba(0, 0, 0, 0.06)",
    borderBottom: "12px solid rgba(0, 0, 0, 0.06)",
    padding: "0",

    boxShadow: "0 5px 10px rgb(239 199 38 / 50%)",
  },
  headerRight: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
    background: "#333",
  },
  footer: {
    textAlign: "center",
    height: "auto",
    paddingBottom: "auto",
    background: "rgba(1, 1, 1, 0.8)",
  },
  activeLink: {
    backgroundColor: "rgba(100, 100, 100, 0.2)",
    color: "#ea8f08",
  },
  linkHover: {
    textDecoration: "none",
    textColor: "white",
    bg: "rgba(100, 100, 100, 0.8)",
  },
};
const App = ({ isServerInfo }) => {
  const { pathname } = useLocation();

  const {
    isWeb3Enabled,
    //authenticate,
    user,
    enableWeb3,
    Moralis,
    isAuthenticated,
    isInitialized,
    walletAddress,
    isWeb3EnableLoading,
  } = useMoralis();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dGoldPrice, setDgoldPrice] = useState(false);
  const [inputValue, setInputValue] = useState("explore");
  const [collectionNFTs, setCollectionNFTs] = useState();
  const [id, setNftId] = useState(1);
  const [nft, setNFT] = useState({});
  const [marketItem, setMarketItem] = useState({});
  const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
  const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;

  useEffect(async () => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Box height={"auto"}>
      <Box>
        <Flex
          w="100%"
          position="fixed"
          zIndex="200"
          h={16}
          alignItems={"center"}
          justifyContent={"center"}
          backgroundColor="rgba(1, 1, 1, 0.8)"
          backdropFilter="saturate(180%) blur(5px)"
          boxShadow={
            "0 4px 8px 0 rgba(0, 0, 0, 0.5), 0 6px 20px 0 rgba(0, 0, 0, 0.7)"
          }
        >
          <Flex
            maxWidth="1200px"
            w="100%"
            px="15px"
            zIndex="200"
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <IconButton
              size={"md"}
              //mr="50"
              variant="outline"
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              //colorScheme="gray"
              aria-label={"Open Menu"}
              display={{ lg: "none" }}
              onClick={isOpen ? onClose : onOpen}
            />
            <Box
              as={ReactLink}
              marginRight={"auto"}
              minW={"45px"}
              maxW={"145px"}
              display={{ base: "none", lg: "block" }}
              to="/"
            >
              <Image
                src={MarketLogo}
                alt="Devious Logo"
                onClick={() => setInputValue("explore")}
                style={{ cursor: "pointer" }}
                //display={{ base: "none", md: "block" }}
              />
            </Box>
            <HStack
              as={"nav"}
              spacing={0}
              display={{ base: "none", lg: "flex" }}
              mx={"auto"}
            >
              <Link
                as={ReactLink}
                px={5}
                py={5}
                color="white"
                border="none"
                activeStyle={styles.activeLink}
                _hover={styles.linkHover}
                _focus
                onClick={() => setInputValue("explore")}
                to="/explore"
              >
                Explore
              </Link>
              <Link
                as={ReactLink}
                px={5}
                py={5}
                color="white"
                //rounded={"md"}
                activeStyle={styles.activeLink}
                _hover={styles.linkHover}
                _focus
                to="/minter"
              >
                Minter
              </Link>
              <Link
                as={ReactLink}
                px={5}
                py={5}
                color="white"
                //rounded={"md"}
                activeStyle={styles.activeLink}
                _hover={styles.linkHover}
                _focus
                to="/Staking"
              >
                Staking
              </Link>
              <Link
                as={ReactLink}
                px={5}
                py={5}
                color="white"
                //rounded={"md"}
                activeStyle={styles.activeLink}
                _hover={styles.linkHover}
                _focus
                to="/mynfts"
              >
                My NFTs
              </Link>
              <Link
                as={ReactLink}
                px={5}
                py={5}
                color="white"
                //rounded={"md"}
                activeStyle={styles.activeLink}
                _hover={styles.linkHover}
                _focus
                to={`/history/${user?.get("ethAddress")}`}
              >
                My Transactions
              </Link>
              <Link
                as={ReactLink}
                px={5}
                py={5}
                color="white"
                //rounded={"md"}
                activeStyle={styles.activeLink}
                _hover={styles.linkHover}
                _focus
                to="/faq"
              >
                Info
              </Link>
            </HStack>
            <Box
              display={{ base: "flex", lg: "flex" }}
              ml={"auto"}
              mr={{ base: "calc(50% - 170px)", lg: "auto" }}
            >
              <TokenPrice
                address="0x9e545b66afad4836656601b0a6c6c4508b33e2c4"
                chain="bsc"
                image={DGOLD}
                size="30px"
                dGoldPrice={dGoldPrice}
                setDgoldPrice={setDgoldPrice}
              />
            </Box>

            <Account />
          </Flex>
        </Flex>

        {isOpen ? (
          <Box
            pos="fixed"
            zIndex="201"
            //left={"5rem"}
            top={"4rem"}
            //ml={-4}
            p={3}
            bg="rgba(5, 
                5, 5, 0.8)"
            display={{ lg: "none" }}
            style={{ backdropFilter: "saturate(180%) blur(5px)" }}
            w="100%"
          >
            <Stack
              as={"nav"}
              spacing={0}
              divider={<StackDivider borderColor="gray.200" w="100%" />}
            >
              {/* <Center mb={"1rem"}>
                  <Account />
                </Center> */}
              <Link
                as={ReactLink}
                px={2}
                py={5}
                color="white"
                //rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  textColor: "white",
                  bg: "rgba(238, 206, 97, 0.5)",
                }}
                _focus
                to="/"
                onClick={() => {
                  setInputValue("explore");
                  onClose();
                }}
              >
                Home
              </Link>
              <Link
                as={ReactLink}
                px={2}
                py={5}
                color="white"
                //rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  textColor: "white",
                  bg: "rgba(238, 206, 97, 0.5)",
                }}
                _focus
                to="/explore"
                onClick={() => {
                  setInputValue("explore");
                  onClose();
                }}
              >
                Explore
              </Link>
              <Link
                as={ReactLink}
                px={2}
                py={5}
                color="white"
                //rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  textColor: "white",
                  bg: "rgba(238, 206, 97, 0.5)",
                }}
                _focus
                onClick={isOpen ? onClose : onOpen}
                to="/minter"
              >
                Minter
              </Link>
              <Link
                as={ReactLink}
                px={2}
                py={5}
                color="white"
                //rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  textColor: "white",
                  bg: "rgba(238, 206, 97, 0.5)",
                }}
                _focus
                onClick={isOpen ? onClose : onOpen}
                to="/Staking"
              >
                Staking
              </Link>
              <Link
                as={ReactLink}
                px={2}
                py={5}
                color="white"
                //rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  textColor: "white",
                  bg: "rgba(238, 206, 97, 0.5)",
                }}
                _focus
                to="/mynfts"
                onClick={isOpen ? onClose : onOpen}
              >
                My NFTs
              </Link>
              <Link
                as={ReactLink}
                px={2}
                py={5}
                color="white"
                //rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  textColor: "white",
                  bg: "rgba(238, 206, 97, 0.5)",
                }}
                _focus
                to={`/history/${user?.get("ethAddress")}`}
                onClick={isOpen ? onClose : onOpen}
              >
                My Transactions
              </Link>
              <Link
                as={ReactLink}
                px={2}
                py={5}
                color="white"
                //rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  textColor: "white",
                  bg: "rgba(238, 206, 97, 0.5)",
                }}
                _focus
                to="/faq"
                onClick={isOpen ? onClose : onOpen}
              >
                Info
              </Link>
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Box>
        <div style={styles.content}>
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route path="/minter" component={Minter} />
            <Route path="/Staking" component={Staking} />
            <Route exact path="/mynfts">
              <NFTBalance
                setNFT={setNFT}
                setMarketItem={setMarketItem}
                setNftId={setNftId}
              />
            </Route>
            <Route
              exact
              path="/collection/:collection"
              component={CollectionPage}
            />
            <Route exact path={`/explore/`}>
              <ExploreNFTs
                inputValue={inputValue}
                setInputValue={setInputValue}
              />
            </Route>
            <Route exact path={`/dashboard`}>
              <Dashboard />
            </Route>

            <Route
              exact
              path="/collection/:collection/:id"
              render={(props) => <InfoPage selectNFT={setNFT} {...props} />}
            />
            <Route
              exact
              path="/collection/:collection/:id/sell"
              render={(props) => <Auction nft={nft} {...props} />}
            />
            <Route
              exact
              path="/history/:address"
              render={(props) => <MyActivity {...props} />}
            />
            <Route exact path="/faq" component={DisplayFAQ} />
          </Switch>
        </div>
      </Box>

      <Box bgColor={"rgb(3,3,3)"}>
        <Box //-----------------------------------------------------------------------------------------------------FOOTER
          mx="auto"
          maxW="7xl"
          py="4"
          px={{
            base: "4",
            md: "8",
          }}
        >
          <Stack>
            <Stack
              direction="row"
              spacing="4"
              align="center"
              justify="space-between"
            >
              <Flex direction={"column"}>
                <Image
                  src={Logos}
                  //w="60px"
                  w={["45px", "45px", "45px", "45px"]}
                  alt="Devious Logo"
                  onClick={() => setInputValue("explore")}
                  style={{ cursor: "pointer" }}
                />
              </Flex>
              <Copyright
                alignSelf={{
                  base: "center",
                  sm: "start",
                  mt: "20px",
                }}
              />
              <SocialMediaLinks />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
