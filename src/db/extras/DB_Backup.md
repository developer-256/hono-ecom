### Make Database Backup

 <!-- ⚠️⚠️⚠️ In Powershell **(administrator)** ⚠️⚠️⚠️ -->

$env:Path += ";C:\Program Files\PostgreSQL\17\bin" % Check the version
pg_dump --version
$env:PGPASSWORD="dbpass"

 <!-- pg_dump -h <hostname> -p <port> -U <username> -d <database_name> -f <output_file.sql> -->

pg_dump -h ep-quiet-mode-a50r8yxg-pooler.us-east-2.aws.neon.tech -p 5432 -U croc_owner -d croc -f D:\work\onlinecrockerystore\src\server\db\crockery_backup.sql
Remove-Variable -Name PGPASSWORD

<!-- ⚠️⚠️⚠️ In Ubuntu this pg_dump is same as above -->

<!-- ⚠️⚠️⚠️ import dump ⚠️⚠️⚠️ -->

$env:PGPASSWORD="password"
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"
pg_dump --version

<!-- change the owner to postgres in file before executing below command -->

psql -h localhost -p 5432 -U postgres -d newcrockery -f D:\work\onlinecrockerystore\src\server\db\crockery_backup.sql
Remove-Variable -Name PGPASSWORD

<!-- for ubuntu -->
<!-- psql -h localhost -p 5432 -U <username> -d <database> -f </path/to/your/crockery_backup.sql> -->

export PGPASSWORD="pass"
pg_dump --version
psql -h localhost -p 5432 -U postgres -d newcrockery -f /path/to/your/crockery_backup.sql
unset PGPASSWORD
