/**
 * @author Stefan Haack (https://shaack.com), all rights reserved
 */
import {Chessboard, INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {Extension} from "cm-chessboard/src/model/Extension.js"
import {MARKER_TYPE, Markers} from "cm-chessboard/src/extensions/markers/Markers.js"

export class EightQueens extends Extension {
    constructor(chessboard, props = {}) {
        super(chessboard)
        chessboard.addExtension(Markers)
        chessboard.initialized.then(() => {
            chessboard.setPosition("qqqqqqqq/8/8/8/8/8/8/8")
            chessboard.enableMoveInput((event) => {
                if(event.type === INPUT_EVENT_TYPE.moveInputStarted) {
                    return true
                }
                if(event.type === INPUT_EVENT_TYPE.validateMoveInput) {
                    const pieceTo = chessboard.getPiece(event.squareTo)
                    return !pieceTo
                }
            })
            this.markThreatened()
        })
    }

    markThreatened() {
        console.log(this.chessboard.state.position.squares)
        let i=0
        for(let square of this.chessboard.state.position.squares) {
            if(square) {
                // mark all squares threatened by this piece
                const rank =  String.fromCharCode(97 + i % 8)
                const file = Math.floor(i / 8) + 1
                const square = "" + rank + file
                console.log(square)
                this.chessboard.addMarker(MARKER_TYPE.circleDanger, square)
            }
            i++
        }
    }
}