/**
 *Submitted for verification at BscScan.com on 2022-01-19
*/

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
                                                         
            Devious Licks GOLD / 2022
                deviouslicks.io
*/

// File: @openzeppelin/contracts/utils/structs/EnumerableSet.sol
// OpenZeppelin Contracts v4.4.1 (utils/structs/EnumerableSet.sol)

pragma solidity ^0.8.0;

/**
 * @dev Library for managing
 * https://en.wikipedia.org/wiki/Set_(abstract_data_type)[sets] of primitive
 * types.
 *
 * Sets have the following properties:
 *
 * - Elements are added, removed, and checked for existence in constant time
 * (O(1)).
 * - Elements are enumerated in O(n). No guarantees are made on the ordering.
 *
 * ```
 * contract Example {
 *     // Add the library methods
 *     using EnumerableSet for EnumerableSet.AddressSet;
 *
 *     // Declare a set state variable
 *     EnumerableSet.AddressSet private mySet;
 * }
 * ```
 *
 * As of v3.3.0, sets of type `bytes32` (`Bytes32Set`), `address` (`AddressSet`)
 * and `uint256` (`UintSet`) are supported.
 */
library EnumerableSet {
    // To implement this library for multiple types with as little code
    // repetition as possible, we write it in terms of a generic Set type with
    // bytes32 values.
    // The Set implementation uses private functions, and user-facing
    // implementations (such as AddressSet) are just wrappers around the
    // underlying Set.
    // This means that we can only create new EnumerableSets for types that fit
    // in bytes32.

    struct Set {
        // Storage of set values
        bytes32[] _values;
        // Position of the value in the `values` array, plus 1 because index 0
        // means a value is not in the set.
        mapping(bytes32 => uint256) _indexes;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function _add(Set storage set, bytes32 value) private returns (bool) {
        if (!_contains(set, value)) {
            set._values.push(value);
            // The value is stored at length-1, but we add 1 to all indexes
            // and use 0 as a sentinel value
            set._indexes[value] = set._values.length;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function _remove(Set storage set, bytes32 value) private returns (bool) {
        // We read and store the value's index to prevent multiple reads from the same storage slot
        uint256 valueIndex = set._indexes[value];

        if (valueIndex != 0) {
            // Equivalent to contains(set, value)
            // To delete an element from the _values array in O(1), we swap the element to delete with the last one in
            // the array, and then remove the last element (sometimes called as 'swap and pop').
            // This modifies the order of the array, as noted in {at}.

            uint256 toDeleteIndex = valueIndex - 1;
            uint256 lastIndex = set._values.length - 1;

            if (lastIndex != toDeleteIndex) {
                bytes32 lastvalue = set._values[lastIndex];

                // Move the last value to the index where the value to delete is
                set._values[toDeleteIndex] = lastvalue;
                // Update the index for the moved value
                set._indexes[lastvalue] = valueIndex; // Replace lastvalue's index to valueIndex
            }

            // Delete the slot where the moved value was stored
            set._values.pop();

            // Delete the index for the deleted slot
            delete set._indexes[value];

            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function _contains(Set storage set, bytes32 value) private view returns (bool) {
        return set._indexes[value] != 0;
    }

    /**
     * @dev Returns the number of values on the set. O(1).
     */
    function _length(Set storage set) private view returns (uint256) {
        return set._values.length;
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function _at(Set storage set, uint256 index) private view returns (bytes32) {
        return set._values[index];
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function _values(Set storage set) private view returns (bytes32[] memory) {
        return set._values;
    }

    // Bytes32Set

    struct Bytes32Set {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(Bytes32Set storage set, bytes32 value) internal returns (bool) {
        return _add(set._inner, value);
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(Bytes32Set storage set, bytes32 value) internal returns (bool) {
        return _remove(set._inner, value);
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(Bytes32Set storage set, bytes32 value) internal view returns (bool) {
        return _contains(set._inner, value);
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(Bytes32Set storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(Bytes32Set storage set, uint256 index) internal view returns (bytes32) {
        return _at(set._inner, index);
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(Bytes32Set storage set) internal view returns (bytes32[] memory) {
        return _values(set._inner);
    }

    // AddressSet

    struct AddressSet {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(AddressSet storage set, address value) internal returns (bool) {
        return _add(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(AddressSet storage set, address value) internal returns (bool) {
        return _remove(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(AddressSet storage set, address value) internal view returns (bool) {
        return _contains(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(AddressSet storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(AddressSet storage set, uint256 index) internal view returns (address) {
        return address(uint160(uint256(_at(set._inner, index))));
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(AddressSet storage set) internal view returns (address[] memory) {
        bytes32[] memory store = _values(set._inner);
        address[] memory result;

        assembly {
            result := store
        }

        return result;
    }

    // UintSet

    struct UintSet {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(UintSet storage set, uint256 value) internal returns (bool) {
        return _add(set._inner, bytes32(value));
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(UintSet storage set, uint256 value) internal returns (bool) {
        return _remove(set._inner, bytes32(value));
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(UintSet storage set, uint256 value) internal view returns (bool) {
        return _contains(set._inner, bytes32(value));
    }

    /**
     * @dev Returns the number of values on the set. O(1).
     */
    function length(UintSet storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(UintSet storage set, uint256 index) internal view returns (uint256) {
        return uint256(_at(set._inner, index));
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(UintSet storage set) internal view returns (uint256[] memory) {
        bytes32[] memory store = _values(set._inner);
        uint256[] memory result;

        assembly {
            result := store
        }

        return result;
    }
}

// File: @openzeppelin/contracts/utils/Context.sol


// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File: Ownable.sol


// OpenZeppelin Contracts v4.4.1 (access/Ownable.sol)

pragma solidity ^0.8.0;

//import "../utils/Context.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
 abstract contract Ownable is Context {
    address private _owner;
    address private _previousOwner;
    uint256 private _lockTime = 0;
    bool public renounced = false;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
        address msgSender = _msgSender();
        _owner = msgSender;
        //emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        renounced = true;
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    //LOCK THE OWNER FUNCTIONS FOR A SPECIFIED TIME
    function getLockTimeRemain() public view returns(uint256){
        require(_lockTime > 0, "No time lock");
        require(_lockTime >= block.timestamp, "No time Lock");
        uint256 time = _lockTime - block.timestamp;
        return time; // SECONDS
    }
    
    function lock(uint256 time) public virtual onlyOwner {
        _previousOwner = _owner;
        _owner = address(0);
        _lockTime = block.timestamp + time;
        emit OwnershipTransferred(_owner, address(0));
    }
    function unlock() public virtual {
        require(!renounced, "Contract renounced, cannot unlock");
        require(_previousOwner == msg.sender, "You don't have permission to unlock");
        require(block.timestamp > _lockTime , "Contract is locked, Please wait the required time");
        emit OwnershipTransferred(_owner, _previousOwner);
        _owner = _previousOwner;
    }
}

// File: @openzeppelin/contracts/token/ERC20/IERC20.sol


// OpenZeppelin Contracts v4.4.1 (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// File: @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol


// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity ^0.8.0;


/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 *
 * _Available since v4.1._
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}

// File: ERC20.sol


// OpenZeppelin Contracts v4.4.1 (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;




/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * The default value of {decimals} is 18. To select a different value for
     * {decimals} you should overload it.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless this function is
     * overridden;
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * Requirements:
     *
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for ``sender``'s tokens of at least
     * `amount`.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }

        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(_msgSender(), spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `sender` to `recipient`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(sender, recipient, amount);

        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;

         emit Transfer(sender, recipient, amount);

        _afterTokenTransfer(sender, recipient, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * has been transferred to `to`.
     * - when `from` is zero, `amount` tokens have been minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens have been burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}

// File: DeviousGold.sol



pragma solidity >=0.8.0 <0.9.0;




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
    address constant MARKETING_WALLET = 0xAAFc265fA07b76e7cFfc6d6Ef7E6399eB4497b4f;
    address constant STAKING_WALLET = 0x5325209E618DE485D893DE4F83e5563650987E03;
    
    // BSC MAINNET ROUTER
    IPancakeRouter router = IPancakeRouter(0x10ED43C718714eb63d5aA57B78B54704E256024E);
    
    //TESTNET 0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3;
   
    
    uint256 feeDenominator = 1000;
    uint256 private tSupply = 1 * 10**8 * (10 ** decimals());// 100m
    uint256 public _maxTxLimit = tSupply / 200;// 0.5% of supply
    uint256 public _maxBurnAmount = tSupply / 10;// Maximum 10% of supply can be burned manually
    uint256 public burned;//Total tokens manually burned
    uint256 private maxBuyTax = 50;
    uint256 private maxSellTax= 150;


    address public pair;
    EnumerableSet.AddressSet dGoldTokenHolders;
    bool isSwapping;
    bool public enableTax = false;
    bool public enableTxLimit = false;

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
        taxSetting[false].push(TaxDivision(address(this), 60, false)); // holder reflection 6%
        taxSetting[false].push(TaxDivision(MARKETING_WALLET, 5, false)); // marketing wallet
        taxSetting[false].push(TaxDivision(STAKING_WALLET, 15, false)); // staking pool
        taxSetting[false].push(TaxDivision(address(0), 20, false)); // burn
        //INITIAL TOTAL SELL TAX
        totalTax[false] = 50 + 60 + 5 + 15 + 20; // 15% SELL TAX

       
        // ACCOUNTS EXEMPT FROM TX LIMIT 
        isTxLimitExempt[msg.sender] = true;
        isTxLimitExempt[address(this)] = true;

        // ACCOUNTS EXEMPT FROM PAYING TAX
        isExemptAccount[msg.sender] = true;
        
        // COLLECTED TOKEN THRESHOLD FOR REFLECTION
        swapThreshold[true] = 5000 * 10 ** decimals(); //100,000 tokens bought / transfered
        swapThreshold[false] = 15000 * 10 ** decimals();//100,000 tokens sold

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
        require(amount <= _maxTxLimit || isTxLimitExempt[sender] || !enableTxLimit || transfer, "TX Limit Exceeded");
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
    function clearRewardAccounts() external onlyOwner {
        delete taxSetting[true];
        delete taxSetting[false];
        totalTax[true] = 0;
        totalTax[false] = 0;
        pendingReward[true] = 0;
        pendingReward[false] = 0;
    }

    //  ADD NEW OR UPDATE EXISTING ACCOUNTS FOR TAX DIVISION WITH LIMITS
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
                if(isBuying){
                    require(totalTax[isBuying] <= maxBuyTax, "The fee is too damn high!");
                } else {
                    require(totalTax[isBuying] <= maxSellTax, "The fee is too damn high!");
                }
                return;
            }
        if(isBuying){
            require(totalTax[isBuying] + percent <= maxBuyTax, "The fee is too damn high!");
        } else {
            require(totalTax[isBuying] + percent <= maxSellTax, "The fee is too damn high!");
        }    
        totalTax[isBuying] += percent;
        taxSetting[isBuying].push(TaxDivision(account, percent, false));
    }

    function setswapThreshold(uint256 amount, bool isBuying) external onlyOwner {
        //limits the max swap threshold amount
        uint256 maxbuyswap = 10000 * 10 ** decimals();
        uint256 maxsellswap = 30000 * 10 ** decimals();
        if(isBuying) {
            require(amount <= maxbuyswap, "Swap limit too high");
        } else {
            require(amount <= maxsellswap, "Swap limit too high");
        }
        swapThreshold[isBuying] = amount;
    }

    //EXPIRE ACCOUNT FROM TAX DIVISON
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
    //USE TO REMOVE PRESALE/DEV CONTRACT(S) FROM REFLECTIONS/HOLDER COUNT
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
   
    event SwapAndLiquify(uint256 tokensSwapped, uint256 bnbReceived, uint256 tokensIntoLiqudity);
    event IsTaxOn(bool enableTax);
    event IsTxLimitOn(bool enableTxLimit);
    event BurnedOnUse(uint256 amount);
}
