package ai.hhrdr.chainflow.engine.plugins;

import ai.hhrdr.chainflow.engine.ethereum.EthereumService;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.impl.history.event.HistoricProcessInstanceEventEntity;
import org.camunda.bpm.engine.impl.history.event.HistoryEvent;
import org.camunda.bpm.engine.impl.history.event.HistoryEventTypes;
import org.camunda.bpm.engine.impl.history.handler.HistoryEventHandler;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.util.List;
import java.util.Map;

import org.camunda.bpm.engine.history.HistoricVariableInstance;

@Component
public class Web3HistoricEventsHandler implements HistoryEventHandler {

    @Autowired
    private EthereumService ethereumService;

    @Autowired
    @Lazy
    private HistoryService historyService;

    @Autowired
    @Lazy
    private RuntimeService runtimeService;

    private static final Logger LOG = LoggerFactory.getLogger(Web3HistoricEventsHandler.class);

    @Override
    public void handleEvent(HistoryEvent historyEvent) {

        if (historyEvent instanceof HistoricProcessInstanceEventEntity) {
            HistoricProcessInstanceEventEntity eventEntity = (HistoricProcessInstanceEventEntity) historyEvent;

            // Check if the event is a process instance start
            if (HistoryEventTypes.PROCESS_INSTANCE_START.getEventName().equals(eventEntity.getEventType())
                    && historyEvent.getExecutionId().equals(historyEvent.getProcessInstanceId())) {
                LOG.info("Process instance with ID "
                        + eventEntity.getProcessInstanceId() + " has START.");

                String definitionKey = historyEvent.getProcessDefinitionKey();
                String processInstanceId = historyEvent.getProcessInstanceId();
                String contractAddress = ethereumService.getContractAddressOfDefinition(definitionKey);

                // Fetching process instance variables
//                List<HistoricVariableInstance> variables = historyService.createHistoricVariableInstanceQuery().processInstanceId(processInstanceId).list();

//                Map<String, Object> variables = runtimeService.getVariables(processInstanceId);


                System.out.println(contractAddress);
//                String transaction = ethereumService.createProcessInstance(
//                        contractAddress,
//                        processInstanceId,
//                        BigInteger.valueOf(0));

            }

            if (HistoryEventTypes.PROCESS_INSTANCE_END.getEventName().equals(eventEntity.getEventType())
                    && historyEvent.getExecutionId().equals(historyEvent.getProcessInstanceId())) {
                LOG.info("Process instance with ID "
                        + eventEntity.getProcessInstanceId() + " has END.");
            }
        }

    }

    @Override
    public void handleEvents(List<HistoryEvent> historyEvents) {

        for (HistoryEvent historyEvent : historyEvents) {
            handleEvent(historyEvent);
        }
    }
}