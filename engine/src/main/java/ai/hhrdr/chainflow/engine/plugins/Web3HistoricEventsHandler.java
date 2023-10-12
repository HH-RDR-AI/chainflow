//package ai.hhrdr.chainflow.engineplugins;
//
//import org.camunda.bpm.engine.impl.history.event.HistoricProcessInstanceEventEntity;
//import org.camunda.bpm.engine.impl.history.event.HistoryEvent;
//import org.camunda.bpm.engine.impl.history.event.HistoryEventTypes;
//import org.camunda.bpm.engine.impl.history.handler.HistoryEventHandler;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.context.event.EventListener;
//import org.springframework.stereotype.Component;
//import org.web3j.abi.FunctionEncoder;
//import org.web3j.abi.TypeReference;
//import org.web3j.abi.datatypes.Function;
//import org.web3j.abi.datatypes.Utf8String;
//import org.web3j.crypto.Credentials;
//import org.web3j.crypto.RawTransaction;
//import org.web3j.crypto.TransactionEncoder;
//import org.web3j.protocol.Web3j;
//import org.web3j.protocol.core.DefaultBlockParameterName;
//import org.web3j.protocol.core.methods.response.EthSendTransaction;
//import org.web3j.protocol.http.HttpService;
//import org.web3j.utils.Numeric;
//
//import java.io.IOException;
//import java.math.BigInteger;
//import java.util.Arrays;
//import java.util.Collections;
//import java.util.List;
//
//@Component
//public class Web3HistoricEventsHandler implements HistoryEventHandler {
//
//    private static final Logger LOG = LoggerFactory.getLogger(Web3HistoricEventsHandler.class);
//
//    @Override
//    @EventListener
//    public void handleEvent(HistoryEvent historyEvent) {
//        Web3j web3j = Web3j.build(new HttpService(""));
//
//        Credentials credentials = Credentials.create("");
//
//        System.out.println(credentials.getAddress());
//
//        String contractAddress = "";
//        BigInteger nonce = null;
//        try {
//            nonce = web3j.ethGetTransactionCount(credentials.getAddress(), DefaultBlockParameterName.LATEST)
//                    .send().getTransactionCount();
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//        BigInteger gasPrice = null;
//        try {
//            gasPrice = web3j.ethGasPrice().send().getGasPrice();
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//        BigInteger gasLimit = BigInteger.valueOf(60000);  // you might want to adjust this value based on the complexity of the function
//
//        Function function = new Function(
//                "setStoredMessage",
//                Arrays.asList(new Utf8String("Hello, World!")),
//                Collections.<TypeReference<?>>emptyList()
//        );
//
//        String encodedFunction = FunctionEncoder.encode(function);
//        RawTransaction rawTransaction = RawTransaction.createTransaction(nonce, gasPrice, gasLimit, contractAddress, encodedFunction);
//
//        byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, 5, credentials);
//        String hexValue = Numeric.toHexString(signedMessage);
//
//        EthSendTransaction transactionResponse = null;
//        try {
//            transactionResponse = web3j.ethSendRawTransaction(hexValue).send();
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//        String transactionHash = transactionResponse.getTransactionHash();
//        System.out.println("Transaction Hash: " + transactionHash);
//
//        if (historyEvent instanceof HistoricProcessInstanceEventEntity) {
//            HistoricProcessInstanceEventEntity eventEntity = (HistoricProcessInstanceEventEntity) historyEvent;
//
//            // Check if the event is a process instance start
//            if (HistoryEventTypes.PROCESS_INSTANCE_START.getEventName().equals(eventEntity.getEventType())
//                    && historyEvent.getExecutionId().equals(historyEvent.getProcessInstanceId())) {
//                LOG.info("Process instance with ID "
//                        + eventEntity.getProcessInstanceId() + " has started.");
//            }
//        }
//
//    }
//
//    @Override
//    public void handleEvents(List<HistoryEvent> historyEvents) {
//
//        for (HistoryEvent historyEvent : historyEvents) {
//            handleEvent(historyEvent);
//        }
//    }
//}