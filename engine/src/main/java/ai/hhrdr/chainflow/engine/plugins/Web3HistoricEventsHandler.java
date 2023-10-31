//package ai.hhrdr.chainflow.engine.plugins;
//
//import ai.hhrdr.chainflow.engine.ethereum.EthereumService;
//import org.camunda.bpm.engine.impl.history.event.HistoricProcessInstanceEventEntity;
//import org.camunda.bpm.engine.impl.history.event.HistoryEvent;
//import org.camunda.bpm.engine.impl.history.event.HistoryEventTypes;
//import org.camunda.bpm.engine.impl.history.handler.HistoryEventHandler;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//import java.util.List;
//import java.util.Objects;
//
//@Component
//public class Web3HistoricEventsHandler implements HistoryEventHandler {
//
//    @Autowired
//    private EthereumService ethereumService;
//
//    private static final Logger LOG = LoggerFactory.getLogger(Web3HistoricEventsHandler.class);
//
//    @Override
//    public void handleEvent(HistoryEvent historyEvent) {
//
//        if (historyEvent instanceof HistoricProcessInstanceEventEntity) {
//            HistoricProcessInstanceEventEntity eventEntity = (HistoricProcessInstanceEventEntity) historyEvent;
//
//            // On instance activated, try to start in blockchain
//            if (HistoryEventTypes.PROCESS_INSTANCE_UPDATE.getEventName().equals(eventEntity.getEventType())
//                    && Objects.equals(eventEntity.getState(), "ACTIVE")) {
//
//
//                String definitionKey = historyEvent.getProcessDefinitionKey();
//                String processInstanceId = historyEvent.getProcessInstanceId();
//
//                String contractAddress = ethereumService.getContractAddressOfDefinition(definitionKey);
//
//                boolean isFinanced = ethereumService.isFinanced(contractAddress, processInstanceId);
//                if (!isFinanced){
//                    throw new RuntimeException("Not enough funds.");
//                }
//                ethereumService.startProcessInstance(contractAddress, processInstanceId);
//
//            }
//            // In instance end, complete in blockchain
//            if (HistoryEventTypes.PROCESS_INSTANCE_END.getEventName().equals(eventEntity.getEventType())
//                    && historyEvent.getExecutionId().equals(historyEvent.getProcessInstanceId())) {
//
//                String definitionKey = historyEvent.getProcessDefinitionKey();
//                String processInstanceId = historyEvent.getProcessInstanceId();
//
//                String contractAddress = ethereumService.getContractAddressOfDefinition(definitionKey);
//
//                ethereumService.completeProcessInstance(contractAddress, processInstanceId);
//            }
//        }
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