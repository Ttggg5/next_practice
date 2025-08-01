import styles from './loading.module.css'

export default function Loading({width}: {width?: number}) {
  return (
    <div className={styles.loader} style={{ width: width }}></div>
  )
}