use core::ops::BitOr;

#[derive(Debug, Eq, PartialEq)]
pub struct Board {
    pub player: u64,
    pub opponent: u64,
    pub holes: u64,
}

impl Board {
    pub fn play(&self, m: u64) -> Self {
        let flipped = self.flipped(m);

        Board {
            player: self.opponent ^ flipped,
            opponent: self.player ^ (flipped | m),
            ..*self
        }
    }

    pub fn pass(&self) -> Self {
        Board {
            player: self.opponent,
            opponent: self.player,
            ..*self
        }
    }

    pub fn moves(&self) -> u64 {
        let empty = !(self.player | self.opponent | self.holes);

        FILL.iter()
            .map(|dir| shift(dir, fill(dir, self.player, self.opponent)))
            .fold(0, BitOr::bitor)
            & empty
    }

    pub fn frontier(&self) -> u64 {
        let empty = !(self.player | self.opponent | self.holes);

        FILL.iter()
            .map(|dir| shift(dir, empty))
            .fold(0, BitOr::bitor)
            & self.player
    }

    pub fn corners(&self) -> u64 {
        let empty = !self.holes;

        Moves(empty)
            .filter(|&m| {
                (0..4).all(|i| {
                    let forwards = &FILL[i];
                    let backwards = &FILL[i + 4];
                    shift(forwards, m) & empty == 0 || shift(backwards, m) & empty == 0
                })
            })
            .fold(0, BitOr::bitor)
    }

    fn flipped(&self, m: u64) -> u64 {
        FILL.iter()
            .map(|dir| {
                let fill = fill(dir, m, self.opponent);
                if shift(dir, fill) & self.player == 0 {
                    0
                } else {
                    fill
                }
            })
            .fold(0, BitOr::bitor)
    }
}

pub struct Moves(pub u64);

impl Iterator for Moves {
    type Item = u64;

    fn next(&mut self) -> Option<Self::Item> {
        if self.0 == 0 {
            None
        } else {
            let m = 1 << (63 - self.0.leading_zeros());
            self.0 ^= m;
            Some(m)
        }
    }
}

type Direction = (u32, u64);

const FILL: [Direction; 8] = [
    (1, 0xfefe_fefe_fefe_fefe),      // left
    (7, 0x7f7f_7f7f_7f7f_7f00),      // up-right
    (8, 0xffff_ffff_ffff_ff00),      // up
    (9, 0xfefe_fefe_fefe_fe00),      // up-left
    (64 - 1, 0x7f7f_7f7f_7f7f_7f7f), // right
    (64 - 7, 0x00fe_fefe_fefe_fefe), // down-left
    (64 - 8, 0x00ff_ffff_ffff_ffff), // down
    (64 - 9, 0x007f_7f7f_7f7f_7f7f), // down-right
];

fn shift(direction: &Direction, bits: u64) -> u64 {
    bits.rotate_left(direction.0) & direction.1
}

fn fill(direction: &Direction, mut bits: u64, mask: u64) -> u64 {
    bits = shift(direction, bits) & mask;
    bits |= shift(direction, bits) & mask;
    bits |= shift(direction, bits) & mask;
    bits |= shift(direction, bits) & mask;
    bits |= shift(direction, bits) & mask;
    bits |= shift(direction, bits) & mask;
    bits |= shift(direction, bits) & mask;
    bits
}

#[cfg(test)]
mod tests {
    use super::*;

    fn bits(s: &str) -> u64 {
        s.chars().fold(0, |acc, c| match c {
            '0' => acc << 1,
            '1' => acc << 1 | 1,
            _ => acc,
        })
    }

    #[test]
    fn moves() {
        let mut moves = Moves(bits(
            "1 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 1",
        ));

        assert_eq!(
            moves.next(),
            Some(bits(
                "1 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0",
            )),
        );
        assert_eq!(
            moves.next(),
            Some(bits(
                "0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 1",
            )),
        );
        assert_eq!(moves.next(), None);
    }

    #[test]
    fn board_moves() {
        let player = bits(
            "0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 1 0 0 0
             0 0 0 1 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0",
        );
        let opponent = bits(
            "0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 1 0 0 0 0
             0 0 0 0 1 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0",
        );
        let holes = bits(
            "0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 1 1 1 1 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0",
        );

        let board = Board {
            player,
            opponent,
            holes,
        };

        assert_eq!(
            board.moves(),
            bits(
                "0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 1 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 1 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0",
            ),
        );
    }

    #[test]
    fn board_play() {
        let player = bits(
            "1 0 0 0 0 0 0 1
             0 0 0 0 0 0 1 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 1 0 0 1",
        );
        let opponent = bits(
            "0 0 0 0 0 0 0 0
             1 0 0 0 0 0 0 0
             1 0 0 0 0 0 0 0
             1 0 0 0 1 0 0 0
             1 0 0 1 0 0 0 0
             1 0 1 0 0 0 0 0
             1 1 0 0 0 0 0 0
             0 1 1 1 0 1 1 0",
        );
        let holes = bits(
            "0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 1 1 1 1 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0",
        );

        let board = Board {
            player,
            opponent,
            holes,
        };

        assert_eq!(
            board.play(bits(
                "0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 1 0 0 0 0 0 0 0",
            )),
            Board {
                player: bits(
                    "0 0 0 0 0 0 0 0
                     0 0 0 0 0 0 0 0
                     0 0 0 0 0 0 0 0
                     0 0 0 0 1 0 0 0
                     0 0 0 1 0 0 0 0
                     0 0 1 0 0 0 0 0
                     0 1 0 0 0 0 0 0
                     0 0 0 0 0 1 1 0",
                ),
                opponent: bits(
                    "1 0 0 0 0 0 0 1
                     1 0 0 0 0 0 1 0
                     1 0 0 0 0 0 0 0
                     1 0 0 0 0 0 0 0
                     1 0 0 0 0 0 0 0
                     1 0 0 0 0 0 0 0
                     1 0 0 0 0 0 0 0
                     1 1 1 1 1 0 0 1",
                ),
                holes,
            },
        );
    }

    #[test]
    fn board_frontier() {
        let player = bits(
            "1 0 0 0 0 0 0 1
             0 0 0 0 0 0 0 0
             0 0 0 1 1 0 0 0
             0 0 0 1 1 0 0 0
             0 0 0 1 1 0 0 0
             0 0 0 1 1 0 0 0
             0 0 0 0 0 0 0 0
             1 0 0 0 0 0 0 1",
        );
        let opponent = bits(
            "0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 1 0 0 0 0 0
             0 0 1 0 0 0 0 0
             0 0 1 0 0 0 0 0
             0 0 1 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0",
        );
        let holes = bits(
            "0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 1 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0",
        );

        let board = Board {
            player,
            opponent,
            holes,
        };

        assert_eq!(
            board.frontier(),
            bits(
                "1 0 0 0 0 0 0 1
                 0 0 0 0 0 0 0 0
                 0 0 0 1 1 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 1 1 0 0 0
                 0 0 0 0 0 0 0 0
                 1 0 0 0 0 0 0 1",
            ),
        );
    }

    #[test]
    fn board_corners() {
        let holes = bits(
            "0 0 0 0 0 0 0 1
             0 0 0 0 1 0 0 0
             0 0 0 0 1 0 0 0
             0 0 0 1 1 0 0 0
             0 0 0 0 1 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0
             0 0 0 0 0 0 0 0",
        );

        let board = Board {
            player: 0,
            opponent: 0,
            holes,
        };

        assert_eq!(
            board.corners(),
            bits(
                "1 0 0 0 0 0 1 0
                 0 0 0 0 0 0 0 1
                 0 0 0 1 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 0 0 0 0 0 0 0 0
                 1 0 0 0 0 0 0 1",
            ),
        );
    }
}
