package com.example.slotserver.engine.core;

import com.example.slotserver.engine.game.constants.GameConstants;
import com.example.slotserver.engine.game.constants.SymbolCodes;
import org.junit.jupiter.api.Test;

import static com.example.slotserver.engine.game.constants.SymbolCodes.*;
import static org.assertj.core.api.Assertions.assertThat;

public class WinLineCalculatorTest {

    final WinLineCalculator winLineCalculator = new WinLineCalculator(GameConstants.WIN_LINES, GameConstants.PAY_TABLE, SymbolCodes.WILD, SymbolCodes.SCATTER);

    @Test
    public void givenNoWinGrid_whenCalculateWin_shouldReturnNoWin() {
        final Grid grid = new Grid(new int[][]{
                {L1, M1, L2},
                {L1, M1, L2},
                {L1, M1, L2}
        });

        final var winData = winLineCalculator.calculateLineWins(grid);

        assertThat(winData.size()).isEqualTo(0);
    }

    @Test
    public void givenWinGrid_whenCalculateWin_shouldReturnWin() {
        final Grid grid = new Grid(new int[][]{
                {L1, L1, L1},
                {L1, M1, L2},
                {L1, M1, L2}
        });

        final var winData = winLineCalculator.calculateLineWins(grid);

        assertThat(winData.size()).isEqualTo(1);
        assertThat(winData.getFirst().getSymbol()).isEqualTo(L1);
        assertThat(winData.getFirst().getLength()).isEqualTo(3);
        assertThat(winData.getFirst().getWinLineId()).isEqualTo(0);
        assertThat(winData.getFirst().getMult()).isEqualTo(GameConstants.PAY_TABLE.get(L1).get(3));
    }
}
