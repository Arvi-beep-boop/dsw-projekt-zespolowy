package com.example.slotserver.model;

public class SpinResult {

    public int[][] grid;
    public int win;

    public SpinResult() {
        this.grid = new int[][]{
                {1, 2, 3},
                {6, 3, 2},
                {4, 1, 1}
        };
        this.win = 20;
    }
}
