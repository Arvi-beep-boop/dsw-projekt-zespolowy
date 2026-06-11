package com.example.slotserver.controller;

import com.example.slotserver.engine.core.GameMode;
import com.example.slotserver.engine.core.Grid;
import com.example.slotserver.model.SpinRequest;
import com.example.slotserver.model.SpinResponse;
import com.example.slotserver.model.SpinResult;
import com.example.slotserver.service.SpinService;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1")
public class SpinController {

    private final SpinService spinService;

    public SpinController(SpinService spinService) {
        this.spinService = spinService;
    }

    @PostMapping("/spin")
    public SpinResponse spin(@RequestBody SpinRequest spinRequest) {

        return spinService.spin(spinRequest);
    }

    @PostMapping("/reload")
    public void reload() {
        spinService.resetBalance();
    }

    @GetMapping("/init")
    public SpinResponse getInitialState() {
        final var spinResult = new SpinResult();
        spinResult.cumulativeWinMoney = 0;
        spinResult.gameMode = GameMode.BASE_GAME;
        spinResult.grid = new Grid(new int[][]{
                {6, 5, 3},
                {7, 8, 8},
                {5, 9, 2}
        });
        spinResult.numFreeSpinsPlayed = 0;
        spinResult.numFreeSpinsAwarded = 0;
        spinResult.totalNumberFreeSpins = 0;
        spinResult.win = 0;
        spinResult.reelStops = new int[]{41, 2, 35};
        return new SpinResponse(List.of(spinResult), spinService.getBalance());
    }
    
}


