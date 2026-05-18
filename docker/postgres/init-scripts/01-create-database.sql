-- 01-create-database.sql
DO
$$
	BEGIN
		IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tgminiapp') THEN
			PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE tgminiapp');
		END IF;
	END
$$;

-- Optional: Grant privileges if needed
-- GRANT ALL PRIVILEGES ON DATABASE tgminiapp TO postgres;
