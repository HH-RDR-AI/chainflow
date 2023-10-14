package ai.hhrdr.chainflow.engine.ethereum;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.DynamicArray;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
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
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EthereumService {

    private final String RPC_URL = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"; // Replace with your Ethereum node RPC URL

    private final String FACTORY_ADDRESS = "0xC59C109a50F9bE2f8bb02B02e30a043Fc51A7427";
//    private final BigInteger GAS_LIMIT = BigInteger.valueOf(60000);

    private final Web3j web3j;

    private final Credentials credentials;


    public EthereumService(@Value("${ethereum.privateKey}") String privateKey) {
        this.web3j = Web3j.build(new HttpService(RPC_URL));
        this.credentials = Credentials.create(privateKey);
    }

    public String sendRawTransaction(String contractAddress, String encodedFunction) {
        try {
            BigInteger gasLimit = DefaultGasProvider.GAS_LIMIT;
            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
            RawTransactionManager rawTransactionManager = new RawTransactionManager(web3j, this.credentials);
            EthSendTransaction ethSendTransaction = rawTransactionManager.sendTransaction(gasPrice, gasLimit, contractAddress, encodedFunction, BigInteger.ZERO);
            return ethSendTransaction.getTransactionHash();

        } catch (Exception e) {
            throw new RuntimeException("Error sending raw transaction", e);
        }
    }

    public String createDefinition(String _hash) {

        List<String> allDefinitions = this.getAllDefinitions(FACTORY_ADDRESS);
        System.out.println(allDefinitions);

        // If deployment exists, return it's name
        if (allDefinitions.contains(_hash)) {
            System.out.println("Contract exists");
            return allDefinitions.get(allDefinitions.indexOf(_hash));
        }
        try {
            org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                    "createDefinition",
                    Arrays.asList(new org.web3j.abi.datatypes.Utf8String(_hash)),
                    Arrays.asList(new org.web3j.abi.TypeReference<org.web3j.abi.datatypes.Address>() {})
            );

            String encodedFunction = FunctionEncoder.encode(function);

            BigInteger gasLimit = DefaultGasProvider.GAS_LIMIT;
            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
            RawTransactionManager rawTransactionManager = new RawTransactionManager(web3j, this.credentials);
            EthSendTransaction ethSendTransaction = rawTransactionManager.sendTransaction(gasPrice, gasLimit, FACTORY_ADDRESS, encodedFunction, BigInteger.ZERO);
            return ethSendTransaction.getTransactionHash();

        } catch (Exception e) {
            throw new RuntimeException("Error sending raw transaction", e);
        }
    }


    public List<String> getAllDefinitions(String contractAddress) {
        org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                "getAllDefenitions",
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

}
