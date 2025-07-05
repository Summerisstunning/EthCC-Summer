// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleStorage - 简单信息存储合约
 * @dev 用于存储用户信息和代币数量的简单合约
 */
contract SimpleStorage {
    
    // 存储结构
    struct UserData {
        string[] messages;      // 字符串数组存储信息
        uint256 tokenAmount;    // 代币数量
        address userAddress;    // 用户钱包地址
        uint256 timestamp;      // 最后更新时间
        bool exists;           // 是否存在记录
    }
    
    // 映射：地址 => 用户数据
    mapping(address => UserData) public userData;
    
    // 所有用户地址列表
    address[] public allUsers;
    
    // 事件
    event DataStored(
        address indexed user,
        string[] messages,
        uint256 tokenAmount,
        uint256 timestamp
    );
    
    event MessageAdded(
        address indexed user,
        string message,
        uint256 timestamp
    );
    
    event TokenAmountUpdated(
        address indexed user,
        uint256 oldAmount,
        uint256 newAmount,
        uint256 timestamp
    );
    
    /**
     * @dev 存储用户信息和代币数量
     * @param _messages 字符串数组，存储用户信息
     * @param _tokenAmount 代币数量
     */
    function storeData(string[] memory _messages, uint256 _tokenAmount) external {
        address user = msg.sender;
        
        // 如果是新用户，添加到用户列表
        if (!userData[user].exists) {
            allUsers.push(user);
            userData[user].exists = true;
            userData[user].userAddress = user;
        }
        
        // 存储数据
        userData[user].messages = _messages;
        userData[user].tokenAmount = _tokenAmount;
        userData[user].timestamp = block.timestamp;
        
        emit DataStored(user, _messages, _tokenAmount, block.timestamp);
    }
    
    /**
     * @dev 添加单个消息到用户的消息数组
     * @param _message 要添加的消息
     */
    function addMessage(string memory _message) external {
        address user = msg.sender;
        
        // 如果是新用户，初始化
        if (!userData[user].exists) {
            allUsers.push(user);
            userData[user].exists = true;
            userData[user].userAddress = user;
            userData[user].tokenAmount = 0;
        }
        
        userData[user].messages.push(_message);
        userData[user].timestamp = block.timestamp;
        
        emit MessageAdded(user, _message, block.timestamp);
    }
    
    /**
     * @dev 更新用户的代币数量
     * @param _newAmount 新的代币数量
     */
    function updateTokenAmount(uint256 _newAmount) external {
        address user = msg.sender;
        
        // 如果是新用户，初始化
        if (!userData[user].exists) {
            allUsers.push(user);
            userData[user].exists = true;
            userData[user].userAddress = user;
        }
        
        uint256 oldAmount = userData[user].tokenAmount;
        userData[user].tokenAmount = _newAmount;
        userData[user].timestamp = block.timestamp;
        
        emit TokenAmountUpdated(user, oldAmount, _newAmount, block.timestamp);
    }
    
    /**
     * @dev 获取用户的所有数据
     * @param _user 用户地址
     * @return messages 用户的消息数组
     * @return tokenAmount 用户的代币数量
     * @return userAddress 用户钱包地址
     * @return timestamp 最后更新时间
     */
    function getUserData(address _user) 
        external 
        view 
        returns (
            string[] memory messages,
            uint256 tokenAmount,
            address userAddress,
            uint256 timestamp
        ) 
    {
        UserData memory data = userData[_user];
        return (data.messages, data.tokenAmount, data.userAddress, data.timestamp);
    }
    
    /**
     * @dev 获取用户的消息数量
     * @param _user 用户地址
     * @return 消息数量
     */
    function getMessageCount(address _user) external view returns (uint256) {
        return userData[_user].messages.length;
    }
    
    /**
     * @dev 获取用户的特定消息
     * @param _user 用户地址
     * @param _index 消息索引
     * @return 消息内容
     */
    function getMessage(address _user, uint256 _index) external view returns (string memory) {
        require(_index < userData[_user].messages.length, "Message index out of bounds");
        return userData[_user].messages[_index];
    }
    
    /**
     * @dev 获取所有用户地址
     * @return 所有用户地址数组
     */
    function getAllUsers() external view returns (address[] memory) {
        return allUsers;
    }
    
    /**
     * @dev 获取用户总数
     * @return 用户总数
     */
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }
    
    /**
     * @dev 检查用户是否存在
     * @param _user 用户地址
     * @return 用户是否存在
     */
    function userExists(address _user) external view returns (bool) {
        return userData[_user].exists;
    }
    
    /**
     * @dev 获取当前调用者的数据
     * @return messages 消息数组
     * @return tokenAmount 代币数量
     * @return timestamp 最后更新时间
     */
    function getMyData() 
        external 
        view 
        returns (
            string[] memory messages,
            uint256 tokenAmount,
            uint256 timestamp
        ) 
    {
        UserData memory data = userData[msg.sender];
        return (data.messages, data.tokenAmount, data.timestamp);
    }
}