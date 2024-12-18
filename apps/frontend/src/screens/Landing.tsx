import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button";

export const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className="pt-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex justify-center">
                    <img src="./chess_board_pieces.png" alt="" className="max-w-96" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-white">Play Chess Online</h1>
                    <div className="mt-4">
                        <Button navigateToLink={() => navigate("/game")}>Play Online</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}