/**
 * @author Stefan Haack (https://shaack.com), all rights reserved
 */
import {INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {Extension} from "cm-chessboard/src/model/Extension.js"
import {MARKER_TYPE, Markers} from "cm-chessboard/src/extensions/markers/Markers.js"
import {Position} from "cm-chessboard/src/model/Position.js"

export class EightQueens extends Extension {
    constructor(chessboard, props = {}) {
        super(chessboard)
        chessboard.addExtension(Markers)
        chessboard.initialized.then(() => {
            chessboard.enableSquareSelect((event) => {
                console.log(event.mouseEvent.type)
                if(event.mouseEvent.type === "mousedown") {
                    if(this.chessboard.getPiece(event.square)) {
                        this.chessboard.setPiece(event.square, null)
                    } else {
                        this.chessboard.setPiece(event.square, "bq")
                    }
                    this.markThreatened()
                }
            })
            this.markThreatened()
        })
    }

    markThreatened() {
        console.log(this.chessboard.state.position.squares)
        this.chessboard.removeMarkers()
        let i = 0
        for (let square of this.chessboard.state.position.squares) {
            if (square) {
                // mark all squares threatened by this piece
                const rank = String.fromCharCode(97 + i % 8)
                const file = Math.floor(i / 8) + 1
                const square = "" + rank + file
                if (this.isThreatened(square)) {
                    this.chessboard.addMarker(MARKER_TYPE.circleDanger, square)
                }
            }
            i++
        }
    }

    isThreatened(square) {
        const [x, y] = Position.squareToCoordinates(square)
        console.log("isThreatened", square, x, y)
        // test file
        for (let sx = 0; sx < 8; sx++) {
            const sSquare = Position.coordinatesToSquare([sx, y])
            if (sSquare === square) {
                continue
            }
            const piece = this.chessboard.getPiece(sSquare)
            if (piece) {
                console.log("a) threatened by", piece, sSquare)
                return true
            }
        }
        // test rank
        for (let sy = 0; sy < 8; sy++) {
            const sSquare = Position.coordinatesToSquare([x, sy])
            if (sSquare === square) {
                continue
            }
            const piece = this.chessboard.getPiece(sSquare)
            if (piece) {
                console.log("b) threatened by", piece, sSquare)
                return true
            }
        }
        // test diagonal
        for (let sy = 0; sy < 8; sy++) {
            const sx = x + sy - y
            if (sx < 0 || sx > 7) {
                continue
            }
            const sSquare = Position.coordinatesToSquare([sx, sy])
            if (sSquare === square) {
                continue
            }
            const piece = this.chessboard.getPiece(sSquare)
            if (piece) {
                console.log("c) threatened by", piece, sSquare)
                return true
            }
        }
        // test diagonal
        for (let sy = 0; sy < 8; sy++) {
            const sx = x - sy + y
            if (sx < 0 || sx > 7) {
                continue
            }
            const sSquare = Position.coordinatesToSquare([sx, sy])
            if (sSquare === square) {
                continue
            }
            const piece = this.chessboard.getPiece(sSquare)
            if (piece) {
                console.log("d) threatened by", piece, sSquare)
                return true
            }
        }
    }
}