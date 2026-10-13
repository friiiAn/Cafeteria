# Cómo ejecutar los scripts de migración

Scripts SQL para crear y sembrar la base de datos del **Sistema de Pedidos Anticipados — Cafetería ITSH** en MySQL 8.0+.

## Requisitos

- MySQL 8.0+ instalado y el servicio de MySQL corriendo.
- Base de datos `cafe_itsh` y usuario `cafe_admin` creados (ver abajo si aún no existen).

## Conexión

Los datos de acceso:

| Dato | Valor |
|------|-------|
| Servidor | `127.0.0.1:3306` |
| Base de datos | `cafe_itsh` |
| Usuario | `cafe_admin` |
| Contraseña | `cafeContra` |

## Crear la base de datos y el usuario (una sola vez)

Con un usuario administrador (por ejemplo `root`):

```sql
CREATE DATABASE IF NOT EXISTS cafe_itsh
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'cafe_admin'@'localhost' IDENTIFIED BY 'cafeContra';
CREATE USER IF NOT EXISTS 'cafe_admin'@'127.0.0.1' IDENTIFIED BY 'cafeContra';
GRANT ALL PRIVILEGES ON cafe_itsh.* TO 'cafe_admin'@'localhost';
GRANT ALL PRIVILEGES ON cafe_itsh.* TO 'cafe_admin'@'127.0.0.1';
FLUSH PRIVILEGES;
```

## Ejecutar los scripts (en orden)

Desde la carpeta del proyecto, en PowerShell o CMD. El cliente `mysql` está en
`C:\Program Files\MySQL\MySQL Server 8.0\bin\`.

**PowerShell** (la redirección `<` no existe en PowerShell; usa `Get-Content` + pipe):

```powershell
Get-Content migrations\001_crear_esquema.sql -Raw | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --default-character-set=utf8mb4 -u cafe_admin -pcafeContra -h 127.0.0.1 -P 3306 cafe_itsh
Get-Content migrations\002_seed_inicial.sql -Raw | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --default-character-set=utf8mb4 -u cafe_admin -pcafeContra -h 127.0.0.1 -P 3306 cafe_itsh
Get-Content migrations\003_pago_metodo_tarjeta.sql -Raw | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --default-character-set=utf8mb4 -u cafe_admin -pcafeContra -h 127.0.0.1 -P 3306 cafe_itsh
```

**CMD**:

```bat
mysql --default-character-set=utf8mb4 -u cafe_admin -pcafeContra -h 127.0.0.1 -P 3306 cafe_itsh < migrations\001_crear_esquema.sql
mysql --default-character-set=utf8mb4 -u cafe_admin -pcafeContra -h 127.0.0.1 -P 3306 cafe_itsh < migrations\002_seed_inicial.sql
mysql --default-character-set=utf8mb4 -u cafe_admin -pcafeContra -h 127.0.0.1 -P 3306 cafe_itsh < migrations\003_pago_metodo_tarjeta.sql
```

Alternativa con `source` desde el propio cliente:

```sql
SOURCE C:/Users/frida/cafeteria/migrations/001_crear_esquema.sql;
SOURCE C:/Users/frida/cafeteria/migrations/002_seed_inicial.sql;
SOURCE C:/Users/frida/cafeteria/migrations/003_pago_metodo_tarjeta.sql;
```

**Importante:** ejecutar en orden `001` → `002` → `003`. El `001` crea las tablas; el `002` inserta los datos base (roles, estados, transiciones, platillos y menú de ejemplo); el `003` amplía el `CHECK` de `pago.metodo` para permitir `tarjeta` en el cobro en caja (requiere MySQL 8.0.16+).

## Nota sobre los triggers

`001_crear_esquema.sql` crea tres triggers (`BEFORE UPDATE`) para mantener
`actualizado_en`. Con el *binary log* activo, MySQL exige que el usuario que crea
triggers tenga el privilegio `SUPER` **o** que el servidor tenga habilitado
`log_bin_trust_function_creators`. Como `cafe_admin` es un usuario normal, el
administrador debe ejecutar una sola vez:

```sql
SET GLOBAL log_bin_trust_function_creators = 1;
```

Si prefieres no habilitarlo, crea los triggers conectado como `root`, o elimina
ese bloque del `001`.

## Ejecutar con DBeaver

1. Abre DBeaver y crea una conexión a **MySQL** con los datos de la tabla de arriba.
2. Abre el archivo `migrations/001_crear_esquema.sql` en un editor SQL.
3. Selecciona toda la consulta y ejecuta (Alt+X o botón SQL → Execute SQL script).
4. Repite con `migrations/002_seed_inicial.sql`.

## Verificar que todo quedó bien

```bash
mysql -u cafe_admin -pcafeContra -h 127.0.0.1 -P 3306 cafe_itsh -e "SHOW TABLES;"
```

Debe mostrar 11 tablas: `estado_pedido`, `menu_dia`, `notificacion`, `pago`, `pedido`, `pedido_detalle`, `pedido_estado_historial`, `platillo`, `rol`, `transicion_estado`, `usuario`.

Ver el menú de ejemplo del día:

```bash
mysql -u cafe_admin -pcafeContra -h 127.0.0.1 -P 3306 cafe_itsh -e "SELECT md.fecha, p.nombre, md.precio, md.especial FROM menu_dia md JOIN platillo p ON p.id = md.platillo_id ORDER BY p.nombre;"
```

## Notas

- El `001` usa `CREATE TABLE` normal: si las tablas ya existen, fallará con "table already exists" (esto es esperado; no re-ejecutes `001` sobre una BD ya poblada sin antes limpiar). El bloque de triggers usa `DROP TRIGGER IF EXISTS`, por lo que esa parte sí es re-ejecutable.
- El `002` es idempotente: usa `ON DUPLICATE KEY UPDATE`, `INSERT IGNORE` y `WHERE NOT EXISTS`, por lo que es seguro re-ejecutarlo.
- Usa siempre `--default-character-set=utf8mb4` al ejecutar los scripts. Sin esta bandera, los caracteres acentuados (por ejemplo el estado `En preparación`) se pueden corromper a `??` si el cliente los interpreta con otra codificación.
- El menú de ejemplo se inserta con la fecha actual (`CURRENT_DATE`). Para tener menú en otro día, ejecuta un `INSERT` manual en `menu_dia` con la fecha deseada.
