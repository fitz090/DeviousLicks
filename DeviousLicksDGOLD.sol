// SPDX-License-Identifier: MIT

/*
██████╗ ███████╗██╗   ██╗██╗ ██████╗ ██╗   ██╗███████╗    
██╔══██╗██╔════╝██║   ██║██║██╔═══██╗██║   ██║██╔════╝    
██║  ██║█████╗  ██║   ██║██║██║   ██║██║   ██║███████╗    
██║  ██║██╔══╝  ╚██╗ ██╔╝██║██║   ██║██║   ██║╚════██║    
██████╔╝███████╗ ╚████╔╝ ██║╚██████╔╝╚██████╔╝███████║    
╚═════╝ ╚══════╝  ╚═══╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝    
                                                          
        ██╗     ██╗ ██████╗██╗  ██╗███████╗               
        ██║     ██║██╔════╝██║ ██╔╝██╔════╝               
        ██║     ██║██║     █████╔╝ ███████╗               
        ██║     ██║██║     ██╔═██╗ ╚════██║               
        ███████╗██║╚██████╗██║  ██╗███████║               
        ╚══════╝╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝ BSC             
                                                         
            Devious Licks dGOLD / 2022
*/

pragma solidity >=0.8.0 <0.9.0;

import "./ERC20.sol";
import "./Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

interface IPancakeRouter {
    function WETH() external pure returns (address);
    function factory() external pure returns (address);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

interface IPancakeFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

contract dGoldToken is ERC20, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    
    // INITIAL IMPORTANT ADDRESSES
    address constant MARKETING_WALLET = 0xC1146Fb10E21dfFfA53172c2E8c616e6851f3D73;
    address constant STAKING_WALLET = 0xcf0822a6b2a3C8289a03C1487950A46D79219f84;
    // BSC MAINNET ROUTER
    IPancakeRouter router = IPancakeRouter(0x10ED43C718714eb63d5aA57B78B54704E256024E);
    //TESTNET 0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3;

    uint256 feeDenominator = 1000;
    uint256 public _totalSupply = 1 * 10**8 * (10 ** decimals());// 100m
    uint256 public _maxTxAmount = _totalSupply / 200;// 0.5% of supply
    uint256 public _maxBurnAmount = _totalSupply / 10;// Maximum 10% of supply can be burned manually
    uint256 public burned;//Total tokens manually burned
    uint256 public burnedOnUse; // Total burned by NFT/item purchases

    address public pair;
    EnumerableSet.AddressSet dGoldTokenHolders;
    bool isSwapping;
    bool public enableTax = true;
    bool public enableTxLimit = true;

    struct TaxDivision {
        address account;
        uint percentage;
        bool isExpired;
    }
    mapping(address => bool) public isExemptAccount;
    mapping(address => bool) isTxLimitExempt;
    mapping(bool => TaxDivision[]) public taxSetting;
    mapping(bool => uint256) public totalTax;
    mapping(bool => uint256) public pendingReward;
    mapping(bool => uint256) public swapThreshold;
    mapping(address => bool) public reflectExempt;
    
    constructor() ERC20 ("Devious Licks Gold", "dGOLD") {
        _mint(msg.sender, 1 * 10**8 * (10 ** decimals())); // 100m
        burned = 0;
        burnedOnUse = 0;
        pair = IPancakeFactory(router.factory()).createPair(router.WETH(), address(this));
        
        // TAX settings (true = buy)
        taxSetting[true].push(TaxDivision(address(this), 20, false)); // holder reflection 2%
        taxSetting[true].push(TaxDivision(MARKETING_WALLET, 5, false)); // marketing wallet
        taxSetting[true].push(TaxDivision(STAKING_WALLET, 5, false)); // staking pool
        taxSetting[true].push(TaxDivision(address(0), 20, false)); // burn
        //INITIAL TOTAL BUY TAX
        totalTax[true] = 20 + 5 + 5 + 20; // 5% BUY TAX
        
        // TAX settings (false = sell)
        taxSetting[false].push(TaxDivision(pair, 50, false)); // liquidity pool
        taxSetting[false].push(TaxDivision(address(this), 70, false)); // holder reflection 7%
        taxSetting[false].push(TaxDivision(MARKETING_WALLET, 5, false)); // marketing wallet
        taxSetting[false].push(TaxDivision(STAKING_WALLET, 5, false)); // staking pool
        taxSetting[false].push(TaxDivision(address(0), 20, false)); // burn
        //INITIAL TOTAL SELL TAX
        totalTax[false] = 50 + 70 + 5 + 5 + 20; // 15% SELL TAX

       
        // ACCOUNTS EXEMPT FROM TX LIMIT 
        isTxLimitExempt[msg.sender] = true;
        isTxLimitExempt[address(this)] = true;

        // ACCOUNTS EXEMPT FROM TAX
        isExemptAccount[msg.sender] = true;
        
        // TOKEN THRESHOLD FOR REFLECTION
        swapThreshold[true] = 1000 * 10 ** decimals();
        swapThreshold[false] = 1000 * 10 ** decimals();

        // REFLECTION EXEMPT ACCOUNTS
        reflectExempt[address(this)] = true;
        reflectExempt[pair] = true;
        reflectExempt[owner()] = true;
        reflectExempt[MARKETING_WALLET] = true;
        reflectExempt[STAKING_WALLET] = true;

    }

    receive() external payable {
    }


    

    function decimals() public pure override returns (uint8) {
        return 9;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal override {
        bool isExempt = isExemptAccount[sender] || isExemptAccount[recipient];
        bool transfer = (sender != pair && recipient != pair);
        uint256 rewardAmount = 0;

        require(amount > 0, "Transfer amount must be greater than zero");
        require(amount <= _maxTxAmount || isTxLimitExempt[sender] || !enableTxLimit || transfer, "TX Limit Exceeded");
        //IERC20(pair).totalSupply() == 0 ||
        if(isExempt || isSwapping || !enableTax) {
            super._transfer(sender, recipient, amount);
        }
        else {
            bool isBuying = (sender == pair) || transfer;
            rewardAmount = amount * totalTax[isBuying] / feeDenominator;

            super._transfer(sender, address(this), rewardAmount);
            pendingReward[isBuying] += rewardAmount;

            if(pendingReward[isBuying] >= swapThreshold[isBuying] && balanceOf(address(this)) >= pendingReward[isBuying]) {
                uint256 reward = pendingReward[isBuying];
                TaxDivision[] memory rewardForTax = taxSetting[isBuying];
                for(uint i = 0; i <  rewardForTax.length; i++){
                    if(rewardForTax[i].isExpired && rewardForTax[i].percentage > 0) continue;
                    // in case of distribute fee to token holders
                    if(rewardForTax[i].account == address(this)){
                        uint countHolders = dGoldTokenHolders.length();
                        if(countHolders == 0){
                            super._transfer(address(this), owner(), reward * rewardForTax[i].percentage / totalTax[isBuying]);
                        }
                        else {
                            uint256 balanceOfHolders = 0; 
                            for(uint j = 0; j < dGoldTokenHolders.length(); j++){
                                balanceOfHolders += balanceOf(dGoldTokenHolders.at(j));
                            }
                            for(uint j = 0; j < countHolders; j++) {
                                uint256 feeToHolders = reward * rewardForTax[i].percentage * balanceOf(dGoldTokenHolders.at(j)) / (totalTax[isBuying] * balanceOfHolders);
                                super._transfer(address(this), dGoldTokenHolders.at(j), feeToHolders);
                            }
                        }
                        
                    }
                    else if(rewardForTax[i].account == pair) {
                        _swapAndLiquify(reward * rewardForTax[i].percentage / totalTax[isBuying]);
                    }
                    else if(rewardForTax[i].account == address(0)) {
                        _burn(address(this), reward * rewardForTax[i].percentage / totalTax[isBuying]);
                    }
                    else {
                        super._transfer(address(this), rewardForTax[i].account, reward * rewardForTax[i].percentage / totalTax[isBuying]);
                    }
                }
                pendingReward[isBuying] = balanceOf(address(this));
            }
            
            super._transfer(sender, recipient, amount - rewardAmount);
        }
        //emit Transfer(sender, recipient, (amount - rewardAmount));

        if(!reflectExempt[recipient] && !dGoldTokenHolders.contains(recipient))
            dGoldTokenHolders.add(recipient);
    }

    
    
    
    function _swapAndLiquify(uint256 contractTokenBalance) private {
        isSwapping = true;
        uint256 half = contractTokenBalance / 2;
        uint256 otherHalf = contractTokenBalance - half;

        uint256 initialBalance = address(this).balance;

        _swapTokensForBNB(half);

        uint256 newBalance = address(this).balance - initialBalance;

        _addLiquidity(otherHalf, newBalance);
        isSwapping = false;

        emit SwapAndLiquify(half, newBalance, otherHalf);
    }

    function _addLiquidity(uint256 tokenAmount, uint256 bnbAmount) private {
        _approve(address(this), address(router), tokenAmount);
        router.addLiquidityETH{value: bnbAmount}( address(this), tokenAmount, 0, 0, owner(), block.timestamp + 300);
    }

    function _swapTokensForBNB(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = router.WETH();

        _approve(address(this), address(router), tokenAmount);

        router.swapExactTokensForETHSupportingFeeOnTransferTokens(tokenAmount, 0, path, address(this), block.timestamp + 300);
    }

    
    
    function getHolderCount() external view returns(uint) {
        return dGoldTokenHolders.length();
    }

    function isHolder(address account) external view returns(bool) {
        return dGoldTokenHolders.contains(account);
    }

    function holderList() external view returns(address[] memory) {
        return dGoldTokenHolders.values();
    }

    
    
    //----ONLY OWNER FUNCTIONS---
    function clearRewardAccount() external onlyOwner {
        delete taxSetting[true];
        delete taxSetting[false];
        totalTax[true] = 0;
        totalTax[false] = 0;
        pendingReward[true] = 0;
        pendingReward[false] = 0;
    }

    // function setRewardAccount(address account, uint percent, bool isBuying) external onlyOwner {
    //     TaxDivision[] memory rewardForTax = taxSetting[isBuying];
    //     for(uint i = 0; i < rewardForTax.length; i++)
    //         if(rewardForTax[i].account == account){
    //             if(rewardForTax[i].isExpired == false) {
    //                 totalTax[isBuying] -= rewardForTax[i].percentage;
    //             }
    //             taxSetting[isBuying][i].isExpired = false;
    //             taxSetting[isBuying][i].percentage = percent;
    //             totalTax[isBuying] += percent;
    //             require(totalTax[isBuying] <= 150, "The fee is too damn high!");
    //             return;
    //         }
    //     taxSetting[isBuying].push(TaxDivision(account, percent, isBuying));
    // }

    function setRewardAccount(address account, uint percent, bool isBuying) external onlyOwner {
        TaxDivision[] memory rewardForTax = taxSetting[isBuying];
        for(uint i = 0; i < rewardForTax.length; i++)
            if(rewardForTax[i].account == account){
                if(rewardForTax[i].isExpired == false) {
                    totalTax[isBuying] -= rewardForTax[i].percentage;
                }
                taxSetting[isBuying][i].isExpired = false;
                taxSetting[isBuying][i].percentage = percent;
                totalTax[isBuying] += percent;
                require(totalTax[isBuying] <= 150, "The fee is too damn high!");
                return;
            }
        taxSetting[isBuying].push(TaxDivision(account, percent, false));
    }


    function setswapThreshold(uint256 amount, bool isBuying) external onlyOwner {
        swapThreshold[isBuying] = amount;
    }

    function setExpireAccountForTax(address account, bool isBuying) external onlyOwner {
        TaxDivision[] memory rewardForTax = taxSetting[isBuying];
        for(uint i = 0; i < rewardForTax.length; i++) {
            if(rewardForTax[i].isExpired == true) continue;
            if(rewardForTax[i].account == account) {
                taxSetting[isBuying][i].isExpired = true;
                totalTax[isBuying] -= rewardForTax[i].percentage;
                return;
            }
        }
    }

    function burnTokens(uint256 amount) external onlyOwner{
         //MAX BURN AMOUNT IS 10% OF SUPPLY
         uint256 newBurnTotal = burned + amount;
         require(newBurnTotal <= _maxBurnAmount && newBurnTotal <= totalSupply(), "Nothing Left to burn");
            _burn(msg.sender, amount);
        burned += amount;
    }

    function setreflectExempt(address account, bool value) external onlyOwner{
        reflectExempt[account] = value;
    }

    function removeHolder(address account) external onlyOwner{
        dGoldTokenHolders.remove(account);
    }

    function setTaxExempt(address account, bool isExempt) external onlyOwner {
        isExemptAccount[account] = isExempt;
    }

    function setTxLimitExemptAddress(address account, bool isTxExempt) external onlyOwner {
        isTxLimitExempt[account] = isTxExempt;
    }

    function switchTax(bool _v) external onlyOwner {
        require (enableTax != _v, "Already set");
        enableTax = _v;
        emit IsTaxOn(enableTax);
    }
    function _enableTxLimit(bool _v) external onlyOwner {
        require (enableTxLimit != _v, "Already set");
        enableTxLimit = _v;
        emit IsTxLimitOn(enableTxLimit);
    }
    //WITHDRAW ANY STUCK BNB IN CONTRACT FROM INTERACTIONS
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
            //BURN ANY STUCK TOKENS
            _burn(address(this), balanceOf(address(this)));
    }
    // FUTURE USE - BURN TOKENS ON NFT/ITEM PURCHASE
    function burnOnUse(address account, uint256 amount) external  {
            account = msg.sender;
            _burn(account, amount);
            burnedOnUse += amount;
            emit BurnedOnUse(amount);
    }

    event SwapAndLiquify(uint256 tokensSwapped, uint256 bnbReceived, uint256 tokensIntoLiqudity);
    event IsTaxOn(bool enableTax);
    event IsTxLimitOn(bool enableTxLimit);
    event BurnedOnUse(uint256 amount);
}
