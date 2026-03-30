package com.example.slotserver.model;

public class SpinRequest {
    private final int bet;

    public SpinRequest() {
        this.bet = 100;
    }

    public SpinRequest(int bet) {
        this.bet = bet;
    }

    public int getBet() {
        return bet;
    }
}

