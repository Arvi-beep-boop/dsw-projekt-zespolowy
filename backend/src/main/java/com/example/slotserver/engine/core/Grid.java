package com.example.slotserver.engine.core;

public class Grid<T> {
    private final int width;
    private final int height;
    private final Object[][] grid;


    public Grid(int width, int height) {
        if(width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Width and height must be positive");
        }
        this.width = width;
        this.height = height;
        this.grid = new Object[width][height];
    }

    public Grid(T[][] grid) {
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

    @SuppressWarnings("unchecked")
    public T getSymbolAt(int x, int y) {
        checkBounds(x, y);
        return (T) this.grid[x][y];
    }

    public void setSymbolAt(int x, int y, T symbol) {
        checkBounds(x, y);
        this.grid[x][y] = symbol;
    }

    public void clear() {
        for(int i = 0; i < width; i++) {
            for(int j = 0; j < height; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    private void checkBounds(int x, int y) {
        if (x < 0 || x >= width || y < 0 || y >= height) {
            throw new IndexOutOfBoundsException();
        }
    }
}
