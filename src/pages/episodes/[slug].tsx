import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import styles from './episode.module.scss'
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import server from '../../../server.json'
import { ptBR } from 'date-fns/locale'
import { GetStaticPaths, GetStaticProps } from 'next'
import { api } from '../../services/api'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'
import { usePlayer } from '../../contexts/PlayerContext'

type Episode = {
  id: string
  title: string
  thumbnail: string
  description: string
  members: string
  duration: number
  durationAsString: string
  url: string
  publishedAt: string
}

type EpisodeProps = {
  episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer()

  //colocar true no fallback
  /* if(router.isFallback) {
        return(
            <p>Carregando...</p>
        )
    }*/

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title}</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image width={700} height={160} src={episode.thumbnail} objectFit="cover" />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const data = server.episodes

  /* const { data } = await api.get('/episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc',
    },
  })*/

  const paths = data.map((episode) => {
    return {
      params: {
        slug: episode.id,
      },
    }
  })

  return {
    paths,
    fallback: 'blocking', //determina o resultado ao acessar uma página que não foi gerada estaticamente. Se for false dá 404, true executa a requisição pelo client para gerar estaticamente
    // e armazenar em disco, e blocking só é redirecionado para nova tela se os dados já estiverem carregados
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params
  // const { data } = await api.get(`/episodes/${slug}`)
  const data = server.episodes.find((episode) => {
    return episode.id == slug
  })
  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  }
  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, //24horas
  }
}