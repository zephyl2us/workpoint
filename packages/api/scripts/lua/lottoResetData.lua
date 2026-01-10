local count = 0

if redis.call("EXISTS", KEYS[1]) == 1 then
  redis.call("DEL", KEYS[1])
end

if redis.call("EXISTS", KEYS[2]) == 1 then
  redis.call("DEL", KEYS[2])
end

if redis.call("EXISTS", KEYS[3]) == 1 then
  redis.call("DEL", KEYS[3])
end

if redis.call("EXISTS", KEYS[4]) == 1 then
  redis.call("DEL", KEYS[4])
end

if redis.call("EXISTS", KEYS[5]) == 1 then
  redis.call("DEL", KEYS[5])
end

local keys = redis.call("KEYS", KEYS[6])
for i = 1, #keys, 1 do
  local key = keys[i]
  redis.call("UNLINK", key)
end

return {count}
