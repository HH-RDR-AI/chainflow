package ai.hhrdr.chainflow.engine.ethereum;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.*;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import java.io.IOException;
import java.math.BigInteger;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EthereumService {

    private String RPC_URL;

    private String FACTORY_ADDRESS;

    private final Web3j web3j;

    private final Credentials credentials;

    private final Integer fee = 500;

    private final Integer chainId = 80001;

    private BigInteger defaultFundingCommitment;


    public EthereumService(@Value("${ethereum.privateKey}") String privateKey,
                           @Value("${ethereum.defaultFundingCommitment}") Integer defaultFundingCommitment,
                           @Value("${ethereum.rpcUrl}") String rpcUrl,
                           @Value("${ethereum.factoryAddress}") String factoryAddress) {
        this.web3j = Web3j.build(new HttpService(rpcUrl));
        this.credentials = Credentials.create(privateKey);
        this.defaultFundingCommitment = BigInteger.valueOf(defaultFundingCommitment);
        this.FACTORY_ADDRESS = factoryAddress;
    }

    private EthSendTransaction sendRawTransaction(Function function, String contractAddress) {
        try {
            // Encode the function
            String encodedFunction = FunctionEncoder.encode(function);

            // Get gas parameters
            BigInteger gasLimit = DefaultGasProvider.GAS_LIMIT;
            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();

            // Use a RawTransactionManager to send the transaction
            RawTransactionManager rawTransactionManager = new RawTransactionManager(web3j, this.credentials, chainId);

            return rawTransactionManager
                    .sendTransaction(gasPrice, gasLimit, contractAddress, encodedFunction, BigInteger.ZERO);
        } catch (Exception e) {
            throw new RuntimeException("Error sending raw transaction", e);
        }
    }

    public String createDefinition(String _hash) {

        List<String> allDefinitions = this.getAllDefinitions(FACTORY_ADDRESS);
        // If deployment exists, return it's name
        if (allDefinitions.contains(_hash)) {
            System.out.println("Contract exists");
            return allDefinitions.get(allDefinitions.indexOf(_hash));
        }
        try {
            org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                    "createDefinition",
                    Arrays.asList(new org.web3j.abi.datatypes.Utf8String(_hash),
                                  new org.web3j.abi.datatypes.generated.Uint256(fee)),
                    Arrays.asList(new org.web3j.abi.TypeReference<org.web3j.abi.datatypes.Address>() {})
            );

            EthSendTransaction ethSendTransaction = sendRawTransaction(function, FACTORY_ADDRESS);
            System.out.println("Deployed process on-chain: " + _hash);
            return ethSendTransaction.getTransactionHash();

        } catch (Exception e) {
            throw new RuntimeException("Error sending raw transaction", e);
        }
    }

    public String getContractAddressOfDefinition(String _hash) {

        org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                "getContractAddressOfDefinition",
                Arrays.asList(new org.web3j.abi.datatypes.Utf8String(_hash)),
                Arrays.asList(new org.web3j.abi.TypeReference<org.web3j.abi.datatypes.Address>() {})
        );
        String encodedFunction = FunctionEncoder.encode(function);
        EthCall response;
        try {
            response = web3j.ethCall(
                            Transaction.createEthCallTransaction(
                                    this.credentials.getAddress(),
                                    FACTORY_ADDRESS,
                                    encodedFunction),
                            DefaultBlockParameterName.LATEST)
                    .send();
        } catch (IOException e) {
            throw new RuntimeException("Error making call", e);
        }

        List<Type> someTypes = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
        Address resultAddress = (Address) someTypes.get(0);
        return resultAddress.getValue();
    }

    public String createProcessInstance(String contractAddress, String processInstanceId, BigInteger neededAmount ) {

        if (neededAmount == null) {
            neededAmount = this.defaultFundingCommitment;
        }

        try {
            org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                    "createProcessInstance",
                    Arrays.asList(new org.web3j.abi.datatypes.Utf8String(processInstanceId),
                                  new org.web3j.abi.datatypes.generated.Uint256(neededAmount)),
                    Arrays.asList(new org.web3j.abi.TypeReference<org.web3j.abi.datatypes.Address>() {})
            );

            EthSendTransaction ethSendTransaction = sendRawTransaction(function, contractAddress);
            System.out.println("Start new process instance on-chain: " + processInstanceId);
            return ethSendTransaction.getTransactionHash();

        } catch (Exception e) {
            throw new RuntimeException("Error sending raw transaction", e);
        }

    }

    public List<String> getAllDefinitions(String contractAddress) {
        org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                "getAllDefinitions",
                Arrays.asList(),
                Arrays.asList(new TypeReference<DynamicArray<Utf8String>>() {})
        );

        String encodedFunction = FunctionEncoder.encode(function);

        EthCall response;
        try {
            response = web3j.ethCall(
                            Transaction.createEthCallTransaction(
                                    this.credentials.getAddress(),
                                    contractAddress,
                                    encodedFunction),
                            DefaultBlockParameterName.LATEST)
                    .send();
        } catch (IOException e) {
            throw new RuntimeException("Error making call", e);
        }

        List<Type> someTypes = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());

        if (someTypes.size() == 0 || !(someTypes.get(0) instanceof DynamicArray)) {
            throw new RuntimeException("Unexpected response from contract");
        }

        DynamicArray<Utf8String> resultArray = (DynamicArray<Utf8String>) someTypes.get(0);
        return resultArray.getValue()
                .stream()
                .map(Utf8String::getValue)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getProcessInstance(String contractAddress, String processInstanceId) {
        org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                "processInstance",
                Arrays.asList(new org.web3j.abi.datatypes.Utf8String(processInstanceId)),
                Arrays.asList(new org.web3j.abi.TypeReference<org.web3j.abi.datatypes.DynamicStruct>() {})
        );
        String encodedFunction = FunctionEncoder.encode(function);

        EthCall response;
        try {
            response = web3j.ethCall(
                            Transaction.createEthCallTransaction(
                                    this.credentials.getAddress(),
                                    contractAddress,
                                    encodedFunction),
                            DefaultBlockParameterName.LATEST)
                    .send();
        } catch (IOException e) {
            throw new RuntimeException("Error making call", e);
        }

        List<Type> responseDecoded = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("processInstanceId", responseDecoded.get(0).getValue());
        resultMap.put("status", responseDecoded.get(1).getValue());
        resultMap.put("claimedAmount", responseDecoded.get(2).getValue());
        resultMap.put("neededAmount", responseDecoded.get(3).getValue());
        resultMap.put("revenue", responseDecoded.get(4).getValue());

        return resultMap;
    }

    public boolean isFinanced(String contractAddress, String processInstanceId) {
        org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                "isFinanced",
                Arrays.asList(new org.web3j.abi.datatypes.Utf8String(processInstanceId)),
                Arrays.asList(new org.web3j.abi.TypeReference<org.web3j.abi.datatypes.Bool>() {})
        );
        String encodedFunction = FunctionEncoder.encode(function);
        EthCall response;
        try {
            response = web3j.ethCall(
                            Transaction.createEthCallTransaction(
                                    this.credentials.getAddress(),
                                    contractAddress,
                                    encodedFunction),
                            DefaultBlockParameterName.LATEST)
                    .send();
        } catch (IOException e) {
            throw new RuntimeException("Error making call", e);
        }

        List<Type> someTypes = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
        Bool resultAddress = (Bool) someTypes.get(0);
        return resultAddress.getValue();
    }

    public void startProcessInstance(String contractAddress, String processInstanceId) {
        try {
            // Create the function using the ABI
            org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                    "startProcessInstance",
                    Arrays.asList(new org.web3j.abi.datatypes.Utf8String(processInstanceId)),
                    Collections.emptyList()  // No outputs for the function based on the ABI
            );

            EthSendTransaction ethSendTransaction = sendRawTransaction(function, contractAddress);

            System.out.println("Start new process instance on-chain with txn "
                    + ethSendTransaction.getTransactionHash());

        } catch (Exception e) {
            throw new RuntimeException("Error sending raw transaction", e);
        }
    }

    public void completeProcessInstance(String contractAddress, String processInstanceId) {
        try {
            // Create the function using the ABI
            org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                    "completeProcessInstance",
                    Arrays.asList(new org.web3j.abi.datatypes.Utf8String(processInstanceId)),
                    Collections.emptyList()  // No outputs for the function based on the ABI
            );

            EthSendTransaction ethSendTransaction = sendRawTransaction(function, contractAddress);

            System.out.println("Complete process instance on-chain with txn "
                    + ethSendTransaction.getTransactionHash());

        } catch (Exception e) {
            throw new RuntimeException("Error sending raw transaction", e);
        }
    }


}
