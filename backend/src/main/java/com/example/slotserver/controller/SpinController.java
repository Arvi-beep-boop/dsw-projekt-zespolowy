package com.example.slotserver.controller;

import com.example.slotserver.Greeting;
import com.example.slotserver.model.SpinResult;
import com.example.slotserver.service.SpinService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.atomic.AtomicLong;


@RestController
public class SpinController {

    private final SpinService spinService;

    public SpinController(SpinService spinService) {
        this.spinService = spinService;
    }

    @GetMapping("/spin")
    public SpinResult spin() {
        return spinService.spin();
    }
}
