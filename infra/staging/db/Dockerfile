# Servidor de base de datos de staging (Fig. 9): PostgreSQL 16 con pgAudit (CC-005), TLS y SCRAM.
FROM postgres:16
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends postgresql-16-pgaudit \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /etc/sce /var/lib/postgresql/tls /respaldos \
  && chown postgres:postgres /etc/sce /var/lib/postgresql/tls /respaldos
COPY entrada.sh /usr/local/bin/entrada.sh
COPY sce-app.sh /docker-entrypoint-initdb.d/sce-app.sh
# Los dos scripts llevan permiso de ejecucion en git; COPY lo conserva. Todo corre como postgres, nunca como root.
USER postgres
ENTRYPOINT ["entrada.sh"]
CMD ["postgres", \
  "-c", "hba_file=/etc/sce/pg_hba.conf", \
  "-c", "ssl=on", \
  "-c", "ssl_min_protocol_version=TLSv1.2", \
  "-c", "ssl_cert_file=/var/lib/postgresql/tls/servidor.crt", \
  "-c", "ssl_key_file=/var/lib/postgresql/tls/servidor.key", \
  "-c", "password_encryption=scram-sha-256", \
  "-c", "shared_preload_libraries=pgaudit", \
  "-c", "log_min_duration_statement=250", \
  "-c", "log_parameter_max_length=0", \
  "-c", "log_parameter_max_length_on_error=0"]
# Consultas de mas de 250 ms al registro, para pgBadger (scripts/pgbadger.sh), sin los valores de sus parametros:
# llevarian datos personales y hashes (CS-SEG-08). El limite de conexiones lo fija la API (connection_limit).
