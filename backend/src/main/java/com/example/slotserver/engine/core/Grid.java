package com.example.slotserver.engine.core;

import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public final class Grid {
    private final int width;
    private final int height;
    private final int[][] grid;


    public Grid(final int width, final int height) {
        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Width and height must be positive");
        }
        this.width = width;
        this.height = height;
        this.grid = new int[width][height];
    }

    public Grid(final Grid grid) {
        this.width = grid.width();
        this.height = grid.height();
        this.grid = Arrays.stream(grid.grid).map(int[]::clone).toArray(int[][]::new);
    }

    public Grid(final int[][] grid) {
        this.width = grid.length;
        this.height = grid[0].length;
        this.grid = grid;
    }

    public int height() {
        return height;
    }

    public int width() {
        return width;
    }

    public int getSymbolAt(final int x, final int y) {
        checkBounds(x, y);
        return this.grid[x][y];
    }

    public void setSymbolAt(int x, int y, int symbol) {
        checkBounds(x, y);
        this.grid[x][y] = symbol;
    }

    public void clear() {
        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    public int count(final int symbol) {
        int count = 0;
        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                if (this.grid[i][j] == symbol) {
                    count++;
                }
            }
        }
        return count;
    }

    @JsonValue
    public int[][] getGrid() {
        return grid;
    }

    private void checkBounds(int x, int y) {
        if (x < 0 || x >= width || y < 0 || y >= height) {
            throw new IndexOutOfBoundsException();
        }
    }
}
