package com.example.slotserver.service;

import com.example.slotserver.engine.SlotEngine;
import com.example.slotserver.model.SpinRequest;
import com.example.slotserver.model.SpinResponse;
import com.example.slotserver.model.SpinResult;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SpinService {

    private final SlotEngine slotEngine;
    private long balance = 1_000_000;

    public SpinService(SlotEngine slotEngine) {
        this.slotEngine = slotEngine;
    }

    public SpinResponse spin(final SpinRequest spinRequest) {
        validateSpinRequest(spinRequest);
        this.balance = Math.subtractExact(balance, spinRequest.getBet());
        final var spinResult = slotEngine.spin(spinRequest);
        this.balance = Math.addExact(balance, spinResult.getLast().cumulativeWinMoney);
        return new SpinResponse(spinResult, balance);
    }

    public void resetBalance() {
        this.balance = 1_000_000;
    }

    public long getBalance() {
        return this.balance;
    }

    private void validateSpinRequest(final SpinRequest spinRequest) {
        if (spinRequest.getBet() < 10 || spinRequest.getBet() > 10000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid bet");
        }
        if (spinRequest.getBet() > balance) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient funds");
        }
    }
}
