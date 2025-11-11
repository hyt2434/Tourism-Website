import { Star, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function ReviewCard({ name, avatar, rating, date, review, helpful }) {
  return (
    <div className="border rounded-xl p-6 bg-white">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatar} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-primary">{name}</h4>
              <p className="text-sm text-muted-foreground">{date}</p>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-foreground mb-3">{review}</p>

          {helpful && (
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span>Hữu ích ({helpful})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
