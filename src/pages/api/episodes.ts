import episodesList from '../../../server.json'

export default function(req, res) {
    res.status(200).send(episodesList.episodes)
}