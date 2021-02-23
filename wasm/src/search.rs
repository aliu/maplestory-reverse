use core::cmp::Ordering;

use crate::board::{Board, Moves};

const INF: i32 = i32::MAX;

pub fn negamax(board: Board, depth: u8) -> Option<u32> {
    fn search(board: Board, depth: u8) -> i32 {
        let next = board.pass();
        let player = board.moves();
        let opponent = next.moves();

        if player | opponent == 0 {
            return match bits(player).cmp(&bits(opponent)) {
                Ordering::Less => -INF,
                Ordering::Equal => 0,
                Ordering::Greater => INF,
            };
        }

        if depth == 0 {
            let corners = {
                let mask = board.corners();
                bits(board.player & mask) - bits(board.opponent & mask)
            };
            let mobility = bits(player) - bits(opponent);
            let frontier = bits(next.frontier()) - bits(board.frontier());
            return 16 * corners + 4 * mobility + frontier;
        }

        Moves(player)
            .map(|m| -search(board.play(m), depth - 1))
            .max()
            .unwrap_or_else(|| -search(next, depth))
    }

    Moves(board.moves())
        .max_by_key(|&m| -search(board.play(m), depth))
        .map(|m| m.leading_zeros())
}

fn bits(mask: u64) -> i32 {
    mask.count_ones() as i32
}
