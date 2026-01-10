local action_balance = redis.call("HINCRBYFLOAT", KEYS[1], ARGV[1], (tonumber(ARGV[3]) * -1))
local target_balance = redis.call("HINCRBYFLOAT", KEYS[2], ARGV[2], tonumber(ARGV[3]))

return {"success", tostring(action_balance), tostring(target_balance)}
