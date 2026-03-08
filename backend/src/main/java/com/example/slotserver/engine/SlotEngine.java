package com.example.slotserver.engine;

import com.example.slotserver.model.SpinResult;
import org.springframework.stereotype.Component;

@Component
public class SlotEngine {

    public SpinResult spin() {

        return new SpinResult();
    }
}
