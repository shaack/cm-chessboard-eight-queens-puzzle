/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-eight-queens-puzzle
 * License: MIT, see file 'LICENSE'
 */
import {INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {Extension} from "cm-chessboard/src/model/Extension.js"
import {MARKER_TYPE, Markers} from "cm-chessboard/src/extensions/markers/Markers.js"
import {Position} from "cm-chessboard/src/model/Position.js"
import {MOVE_CANCELED_REASON} from "cm-chessboard/src/view/VisualMoveInput.js"
import {HtmlLayer} from "cm-chessboard/src/extensions/html-layer/HtmlLayer.js"

export const GAME_EVENT_TYPE = {
    move: "move",
    createPiece: "createPiece",
    removePiece: "removePiece",
    won: "won"
}

export class EightQueensPuzzle extends Extension {

    /** @constructor */
    constructor(chessboard, props = {}) {
        super(chessboard)
        this.props = {
            wonText: "Very good,<br/>you did it!", // the text that is shown when the puzzle is solved
            onGameEvent: undefined // callback after each position change
        }
        Object.assign(this.props, props)
        chessboard.addExtension(Markers)
        chessboard.addExtension(HtmlLayer)
        this.clickListener = this.onSquareClick.bind(this)
        chessboard.context.addEventListener("click", this.clickListener)
        chessboard.enableMoveInput((event) => {
            switch (event.type) {
                case INPUT_EVENT_TYPE.moveInputStarted:
                    return true
                case INPUT_EVENT_TYPE.moveInputCanceled:
                    if (event.reason === MOVE_CANCELED_REASON.movedOutOfBoard) {
                        this.chessboard.setPiece(event.squareFrom, null)
                        if (this.props.onGameEvent) {
                            this.props.onGameEvent({
                                position: this.chessboard.getPosition(),
                                type: GAME_EVENT_TYPE.removePiece
                            })
                        }
                    }
                    return true
                case INPUT_EVENT_TYPE.validateMoveInput:
                    if (this.props.onGameEvent) {
                        this.props.onGameEvent({
                            position: this.chessboard.getPosition(),
                            type: GAME_EVENT_TYPE.move
                        })
                    }
                    return true
                case INPUT_EVENT_TYPE.moveInputFinished:

            }
            this.markThreatened()
        })
        this.markThreatened()
    }

    onSquareClick(event) {
        const square = event.target.getAttribute("data-square")
        if (square && !this.chessboard.getPiece(square)) {
            const pieces = this.chessboard.state.position.getPieces()
            if (pieces.length < 8) {
                this.chessboard.setPiece(square, "bq")
                if (this.props.onGameEvent) {
                    this.props.onGameEvent({
                        position: this.chessboard.getPosition(),
                        type: GAME_EVENT_TYPE.createPiece
                    })
                }
                this.markThreatened()
            }
        }
    }

    markThreatened() {
        this.chessboard.removeMarkers()
        let i = 0
        let threadsFound = 0
        for (let square of this.chessboard.state.position.squares) {
            if (square) {
                // mark all squares threatened by this piece
                const rank = String.fromCharCode(97 + i % 8)
                const file = Math.floor(i / 8) + 1
                const square = "" + rank + file
                if (this.isThreatened(square)) {
                    this.chessboard.addMarker(MARKER_TYPE.circleDanger, square)
                    threadsFound++
                }
            }
            i++
        }
        if (threadsFound === 0) {
            const pieces = this.chessboard.state.position.getPieces()
            if (pieces.length === 8) {
                this.wonAnimation()
                if (this.props.onGameEvent) {
                    this.props.onGameEvent({
                        position: this.chessboard.getPosition(),
                        type: GAME_EVENT_TYPE.won
                    })
                }
            }
        }
    }

    wonAnimation() {
        const layer = this.chessboard.addHtmlLayer(`<div class='text fx-won'><div>${this.props.wonText}</div></div>`)
        const text = layer.querySelector("div.text")
        layer.classList.add("fx-fade-in")
        setTimeout(() => {
            layer.addEventListener("click", () => {
                text.classList.remove("fx-won")
                layer.classList.add("fx-fade-in")
                text.classList.add("fx-vanish")
                layer.classList.add("fx-fade-out")
                setTimeout(() => {
                    this.chessboard.removeHtmlLayer(layer)
                }, 1000)
            })
        }, 1000)
    }

    isThreatened(square) {
        const [x, y] = Position.squareToCoordinates(square)
        // console.log("isThreatened", square, x, y)
        // test file
        for (let sx = 0; sx < 8; sx++) {
            const sSquare = Position.coordinatesToSquare([sx, y])
            if (sSquare === square) {
                continue
            }
            const piece = this.chessboard.getPiece(sSquare)
            if (piece) {
                // console.log("a) threatened by", piece, sSquare)
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
                // console.log("b) threatened by", piece, sSquare)
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
                // console.log("c) threatened by", piece, sSquare)
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
                // console.log("d) threatened by", piece, sSquare)
                return true
            }
        }
    }
}
