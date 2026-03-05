package com.example.slotserver.service;

import com.example.slotserver.engine.SlotEngine;
import com.example.slotserver.model.SpinResult;
import org.springframework.stereotype.Service;

@Service
public class SpinService {

    private final SlotEngine slotEngine;

    public SpinService(SlotEngine slotEngine) {
        this.slotEngine = slotEngine;
    }

    public SpinResult spin() {
        return slotEngine.spin();
    }
}
