package ai.hhrdr.chainflow.engine.ethereum;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;

import java.math.BigInteger;

@Service
public class EthereumService {

    private final String RPC_URL = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"; // Replace with your Ethereum node RPC URL

    private final BigInteger GAS_LIMIT = BigInteger.valueOf(60000);
    private final Web3j web3j;

    private final Credentials credentials;


    public EthereumService(@Value("${ethereum.privateKey}") String privateKey) {
        this.web3j = Web3j.build(new HttpService(RPC_URL));
        this.credentials = Credentials.create(privateKey);
    }

    public String sendRawTransaction(String contractAddress, String encodedFunction) {
        try {
            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
            RawTransactionManager rawTransactionManager = new RawTransactionManager(web3j, this.credentials);
            EthSendTransaction ethSendTransaction = rawTransactionManager.sendTransaction(gasPrice, GAS_LIMIT, contractAddress, encodedFunction, BigInteger.ZERO);
            return ethSendTransaction.getTransactionHash();

        } catch (Exception e) {
            throw new RuntimeException("Error sending raw transaction", e);
        }
    }
}
