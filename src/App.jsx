import { GameProvider, useGame, PHASES } from './context/GameContext'
import HomePage from './pages/HomePage'
import LobbyPage from './pages/LobbyPage'
import RoleRevealPage from './pages/RoleRevealPage'
import NightPage from './pages/NightPage'
import MorningPage from './pages/MorningPage'
import DiscussionPage from './pages/DiscussionPage'
import VotingPage from './pages/VotingPage'
import VoteResultPage from './pages/VoteResultPage'
import VoteTiePage from './pages/VoteTiePage'
import GameOverPage from './pages/GameOverPage'

function GameRouter() {
  const { state } = useGame()

  switch (state.phase) {
    case PHASES.HOME:
      return <HomePage />
    case PHASES.LOBBY:
      return <LobbyPage />
    case PHASES.ROLE_REVEAL:
      return <RoleRevealPage />
    case PHASES.NIGHT_WEREWOLF:
    case PHASES.NIGHT_DOKTER:
    case PHASES.NIGHT_DETEKTIF:
      return <NightPage />
    case PHASES.MORNING:
      return <MorningPage />
    case PHASES.DISCUSSION:
      return <DiscussionPage />
    case PHASES.VOTING:
      return <VotingPage />
    case PHASES.VOTE_TIE:
      return <VoteTiePage />
    case PHASES.VOTE_RESULT:
      return <VoteResultPage />
    case PHASES.GAME_OVER:
      return <GameOverPage />
    default:
      return <HomePage />
  }
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  )
}
