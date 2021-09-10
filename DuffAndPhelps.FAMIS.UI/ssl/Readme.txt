The SSL directory has been added to create a self signed cert.

To create a self signed cert complete the following steps
1. in the project root folder run the command "node sslgen.js". This will create a new self signed cert
(note you may need to install the npm package "selfsigned" in order for this command to execute)

2. Once the certs are generated, install the cert to local machine Root Trusted Authority Certificate store

3. When serving the application using angular CLI run the following command
ng serve --port 3000 --ssl 1 --ssl-key ".\ssl\server.key" --ssl-cert ".\ssl\server.crt"

4. If the browser is refreshing excessively disable the live reload via
ng serve --port 3000 --ssl 1 --ssl-key ".\ssl\server.key" --ssl-cert ".\ssl\server.crt" --live-reload false


browse to port https://localhost:[portnumber] and enjoy SSL localhost!
