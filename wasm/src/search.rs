use core::cmp;

use crate::board::{Board, Moves};

const INF: i32 = i32::MAX;

pub fn negamax(board: Board, depth: u8) -> Option<u32> {
    fn search(board: Board, depth: u8, mut alpha: i32, beta: i32) -> i32 {
        let next = board.pass();
        let player = board.moves();
        let opponent = next.moves();

        if player == 0 {
            if opponent == 0 {
                return 2048 * (bits(board.player) - bits(board.opponent));
            } else {
                return -search(next, depth, -beta, -alpha);
            }
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

        let mut best = -INF;
        for m in Moves(player) {
            best = cmp::max(best, -search(board.play(m), depth - 1, -beta, -alpha));
            alpha = cmp::max(alpha, best);
            if alpha >= beta {
                break;
            }
        }

        best
    }

    Moves(board.moves())
        .max_by_key(|&m| -search(board.play(m), depth, -INF, INF))
        .map(|m| m.leading_zeros())
}

fn bits(mask: u64) -> i32 {
    mask.count_ones() as i32
}
