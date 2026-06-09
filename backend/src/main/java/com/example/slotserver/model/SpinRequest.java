package com.example.slotserver.model;

public class SpinRequest {
    private int bet;
    private int forcedResultID;

    public SpinRequest() {
        this.bet = 100;
        this.forcedResultID = 0;
    }

    public SpinRequest(int bet) {
        this.bet = bet;
        this.forcedResultID = 0;
    }

    public SpinRequest(int bet, int forcedResultID) {
        this.bet = bet;
        this.forcedResultID = forcedResultID;
    }

    public int getBet() {
        return bet;
    }

    public int getForcedResultID() {
        return forcedResultID;
    }

    public void setBet(int bet) { this.bet = bet; }
    public void setForcedResultID(int forcedResultID) { this.forcedResultID = forcedResultID; }
}

