#![no_std]

use wasm_bindgen::prelude::*;

mod board;
mod search;

use board::Board;

#[wasm_bindgen]
pub fn evaluate(player: u64, opponent: u64, holes: u64, depth: u8) -> Option<u32> {
    let board = Board {
        player,
        opponent,
        holes,
    };
    search::negamax(board, depth)
}
