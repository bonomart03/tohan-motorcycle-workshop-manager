# Taller Tohan — Diseño de Base de Datos

## Diagrama Entidad-Relación (MER)

```
┌─────────────────────────┐       ┌─────────────────────────┐
│         users           │       │        clientes          │
├─────────────────────────┤       ├─────────────────────────┤
│ id          UUID PK     │       │ id          UUID PK     │
│ email       VARCHAR(255)│       │ nombre      VARCHAR(100) │
│ password_hash VARCHAR   │       │ apellido    VARCHAR(100) │
│ nombre      VARCHAR(100)│       │ dni         VARCHAR(20)  │
│ rol         ENUM        │       │ domicilio   TEXT         │
│ activo      BOOLEAN     │       │ cedula_digital VARCHAR   │
│ created_at  TIMESTAMPTZ │       │ created_at  TIMESTAMPTZ │
│ updated_at  TIMESTAMPTZ │       │ updated_at  TIMESTAMPTZ │
└─────────────────────────┘       └────────────┬────────────┘
                                               │ 1
                                               │
                                               │ N
                                  ┌────────────▼────────────┐
                                  │        vehiculos         │
                                  ├─────────────────────────┤
                                  │ id          UUID PK     │
                                  │ cliente_id  UUID FK     │
                                  │ marca       VARCHAR(100) │
                                  │ modelo      VARCHAR(100) │
                                  │ dominio     VARCHAR(20)  │
                                  │ nro_chasis  VARCHAR(50)  │
                                  │ nro_cuadro  VARCHAR(50)  │
                                  │ kilometraje INTEGER      │
                                  │ created_at  TIMESTAMPTZ │
                                  │ updated_at  TIMESTAMPTZ │
                                  └────────────┬────────────┘
                                               │ 1
                                               │
                                               │ N
                                  ┌────────────▼────────────┐
                                  │         servicios        │
                                  ├─────────────────────────┤
                                  │ id          UUID PK     │
                                  │ vehiculo_id UUID FK     │
                                  │ user_id     UUID FK     │
                                  │ descripcion TEXT        │
                                  │ diagnostico TEXT        │
                                  │ trabajos_realizados TEXT│
                                  │ repuestos_utilizados TEXT│
                                  │ costo_mano_obra DECIMAL │
                                  │ costo_repuestos DECIMAL │
                                  │ estado      ENUM        │
                                  │ km_ingreso  INTEGER     │
                                  │ km_egreso   INTEGER     │
                                  │ fecha_ingreso TIMESTAMPTZ│
                                  │ fecha_salida  TIMESTAMPTZ│
                                  │ created_at  TIMESTAMPTZ │
                                  │ updated_at  TIMESTAMPTZ │
                                  └─────────────────────────┘
```

## Normalización

- **1FN**: Todos los campos son atómicos (nombre y apellido separados, etc.)
- **2FN**: Sin dependencias parciales — todas las columnas dependen de la PK completa
- **3FN**: Sin dependencias transitivas — datos del cliente no se repiten en vehículos ni servicios

## Índices recomendados

```sql
CREATE INDEX idx_clientes_dni        ON clientes(dni);
CREATE INDEX idx_vehiculos_dominio   ON vehiculos(dominio);
CREATE INDEX idx_vehiculos_cliente   ON vehiculos(cliente_id);
CREATE INDEX idx_servicios_vehiculo  ON servicios(vehiculo_id);
CREATE INDEX idx_servicios_estado    ON servicios(estado);
CREATE INDEX idx_servicios_fecha_ing ON servicios(fecha_ingreso DESC);
```

## Diagrama UML de Clases (Backend)

```
┌──────────────────────────────────┐
│         <<Controller>>           │
│         AuthController           │
├──────────────────────────────────┤
│ + login(req, res): Promise<void> │
│ + logout(req, res): void         │
│ + me(req, res): Promise<void>    │
└─────────────┬────────────────────┘
              │ uses
              ▼
┌──────────────────────────────────┐
│          <<Service>>             │
│          AuthService             │
├──────────────────────────────────┤
│ + login(email, pass): User       │
│ + hashPassword(p): string        │
│ + comparePassword(p,h): boolean  │
│ + generateToken(payload): string │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│         <<Controller>>           │
│        ClienteController         │
├──────────────────────────────────┤
│ + index(req, res): Promise<void> │
│ + show(req, res): Promise<void>  │
│ + create(req, res): Promise<void>│
│ + update(req, res): Promise<void>│
│ + destroy(req, res):Promise<void>│
└─────────────┬────────────────────┘
              │ uses
              ▼
┌──────────────────────────────────┐
│          <<Service>>             │
│         ClienteService           │
├──────────────────────────────────┤
│ + findAll(page, limit): Page<C>  │
│ + findById(id): Cliente          │
│ + findByDni(dni): Cliente        │
│ + create(dto): Cliente           │
│ + update(id, dto): Cliente       │
│ + delete(id): void               │
└─────────────┬────────────────────┘
              │ uses
              ▼
┌──────────────────────────────────┐
│         <<Repository>>           │
│           PrismaClient           │
└──────────────────────────────────┘
```
