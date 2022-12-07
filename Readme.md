# GeoGo

## Api

- POST : /api/geogo
- GET : /api/geogo

## SQL

Delete

```sql
DELETE FROM PUBLIC.ressource WHERE  st_intersects(coo,st_geomfromtext('POINT(-0.457482 46.321705)', 4326))
```

Insert

```sql
INSERT INTO PUBLIC.ressource(id,coo,RADIUS) VALUES(1,st_geomfromtext('POINT(-0.457482 46.321705)',4326),10)
```
