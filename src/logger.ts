import winston from 'winston'

const logFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
  let metaString = JSON.stringify(metadata)
  if (metaString !== '{}') metaString = ` ${metaString}`
  return `${timestamp} [${level}]: ${message}${metaString}`
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  defaultMeta: { service: 'Bagpipes-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat,
      ),
    }),
  )
}

export default logger
