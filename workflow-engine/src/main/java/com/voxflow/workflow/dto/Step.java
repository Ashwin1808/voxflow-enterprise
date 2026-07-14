package com.voxflow.workflow.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.Map;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = PlayPromptStep.class, name = "PLAY_PROMPT"),
    @JsonSubTypes.Type(value = CollectInputStep.class, name = "COLLECT_INPUT"),
    @JsonSubTypes.Type(value = ConditionalStep.class, name = "CONDITIONAL"),
    @JsonSubTypes.Type(value = UpdateStatusStep.class, name = "UPDATE_STATUS"),
    @JsonSubTypes.Type(value = SendVisualIvrStep.class, name = "SEND_VISUAL_IVR"),
    @JsonSubTypes.Type(value = SendNotificationStep.class, name = "SEND_NOTIFICATION"),
    @JsonSubTypes.Type(value = InitiatePaymentStep.class, name = "INITIATE_PAYMENT"),
    @JsonSubTypes.Type(value = EndStep.class, name = "END")
})
public abstract class Step {
    private String id;
    private String next;

    public Step() {}

    public Step(String id, String next) {
        this.id = id;
        this.next = next;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNext() {
        return next;
    }

    public void setNext(String next) {
        this.next = next;
    }
}
