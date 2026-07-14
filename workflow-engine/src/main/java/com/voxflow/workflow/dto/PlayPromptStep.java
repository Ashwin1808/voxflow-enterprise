package com.voxflow.workflow.dto;

public class PlayPromptStep extends Step {
    private String text;
    private String language;
    private String audioUrl;

    public PlayPromptStep() {
        super();
    }

    public PlayPromptStep(String id, String next, String text, String language, String audioUrl) {
        super(id, next);
        this.text = text;
        this.language = language;
        this.audioUrl = audioUrl;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }
}
